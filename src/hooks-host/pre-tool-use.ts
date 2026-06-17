import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { recordUsageSync } from "../usage";

const EXCEPTIONS = new Set([
  "tkr", "tkr-exec", "token", "claude",
  "cd", "export", "source", "echo", "mkdir", "rm", "mv", "cp", "chmod", "ln",
  "true", "false", ":", "test", "[", "exit", "return",
  "nohup", "sudo", "doas", "env"
]);

const SHELL_WORDS = new Set([
  "for", "while", "until", "if", "then", "else", "elif", "fi", "do", "done",
  "case", "esac", "select", "function", "time", "coproc", "in",
  "!", "[[", "]]", "{", "}", ".",
  "declare", "typeset", "local", "readonly", "unset", "set", "shift", "trap",
  "wait", "read", "eval", "exec", "break", "continue", "pushd", "popd", "dirs",
  "alias", "unalias", "hash", "ulimit", "umask", "getopts", "let", "shopt",
  "builtin", "command", "compgen", "complete", "disown", "suspend", "jobs",
  "fg", "bg", "kill", "history", "fc", "bind", "enable", "caller", "type"
]);

const INTERPRETERS = new Set([
  "sh", "bash", "zsh", "dash", "ksh", "fish",
  "python", "python3", "python2", "node", "ruby", "perl", "php", "awk", "sed",
  "deno", "bun"
]);

const ASSIGN_RE = /^[A-Za-z_][A-Za-z0-9_]*\+?=/;
const FUNC_DEF_RE = /^[A-Za-z_][A-Za-z0-9_-]*\s*\(\s*\)/;
const FUNC_DEF_ANYWHERE = /(?:^|[;&|\n({])\s*[A-Za-z_][A-Za-z0-9_-]*\s*\(\s*\)/;

function basename(word: string): string {
  const slash = word.lastIndexOf("/");
  return slash === -1 ? word : word.slice(slash + 1);
}

function hasTopLevelRedirect(seg: string): boolean {
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let escape = false;
  for (let i = 0; i < seg.length; i++) {
    const c = seg[i]!;
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\") {
      escape = true;
      continue;
    }
    if (!inDouble && !inBacktick && c === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && !inBacktick && c === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && c === "`") {
      inBacktick = !inBacktick;
      continue;
    }
    if (!inSingle && !inDouble && !inBacktick && c === ">") return true;
  }
  return false;
}

type Segment = { kind: "cmd" | "sep"; text: string };

export function splitTopLevel(cmd: string): Segment[] {
  const segs: Segment[] = [];
  let buf = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inBacktick = false;
  let escape = false;
  let parenDepth = 0;
  let braceDepth = 0;

  const pushCmd = () => {
    if (buf.length > 0) {
      segs.push({ kind: "cmd", text: buf });
      buf = "";
    }
  };
  const pushSep = (sep: string) => {
    pushCmd();
    segs.push({ kind: "sep", text: sep });
  };

  while (i < cmd.length) {
    const c = cmd[i]!;

    if (escape) {
      buf += c;
      escape = false;
      i += 1;
      continue;
    }
    if (c === "\\") {
      buf += c;
      escape = true;
      i += 1;
      continue;
    }
    if (!inDouble && !inBacktick && c === "'") {
      inSingle = !inSingle;
      buf += c;
      i += 1;
      continue;
    }
    if (!inSingle && !inBacktick && c === '"') {
      inDouble = !inDouble;
      buf += c;
      i += 1;
      continue;
    }
    if (!inSingle && !inDouble && c === "`") {
      inBacktick = !inBacktick;
      buf += c;
      i += 1;
      continue;
    }

    const protectedCtx = inSingle || inDouble || inBacktick;

    if (!protectedCtx) {
      if (c === "$" && cmd[i + 1] === "{") {
        buf += "${";
        braceDepth += 1;
        i += 2;
        continue;
      }
      if (braceDepth > 0) {
        if (c === "{") braceDepth += 1;
        else if (c === "}") braceDepth -= 1;
        buf += c;
        i += 1;
        continue;
      }
      if (c === "$" && cmd[i + 1] === "(") {
        buf += "$(";
        parenDepth += 1;
        i += 2;
        continue;
      }
      if (c === "(") {
        buf += "(";
        parenDepth += 1;
        i += 1;
        continue;
      }
      if (parenDepth > 0) {
        if (c === "(") parenDepth += 1;
        else if (c === ")") parenDepth -= 1;
        buf += c;
        i += 1;
        continue;
      }
      if (c === ">" && cmd[i + 1] === "|") {
        buf += ">|";
        i += 2;
        continue;
      }
      if (c === "&" && cmd[i + 1] === "&") {
        pushSep("&&");
        i += 2;
        continue;
      }
      if (c === "&" && cmd[i + 1] !== ">") {
        const trimmed = buf.replace(/\s+$/, "");
        const last = trimmed[trimmed.length - 1];
        if (last !== ">" && last !== "<" && last !== "&") {
          pushSep("&");
          i += 1;
          continue;
        }
      }
      if (c === "|" && cmd[i + 1] === "|") {
        pushSep("||");
        i += 2;
        continue;
      }
      if (c === "|" && cmd[i + 1] === "&") {
        pushSep("|&");
        i += 2;
        continue;
      }
      if (c === ";" && cmd[i + 1] === ";") {
        const triple = cmd[i + 2] === "&";
        pushSep(triple ? ";;&" : ";;");
        i += triple ? 3 : 2;
        continue;
      }
      if (c === ";") {
        pushSep(";");
        i += 1;
        continue;
      }
      if (c === "\n") {
        pushSep("\n");
        i += 1;
        continue;
      }
      if (c === "|") {
        pushSep("|");
        i += 1;
        continue;
      }
    }

    buf += c;
    i += 1;
  }

  if (inSingle || inDouble || inBacktick || parenDepth !== 0 || braceDepth !== 0 || escape) {
    return [{ kind: "cmd", text: cmd }];
  }
  pushCmd();
  return segs;
}

function firstWord(seg: string): string {
  return seg.trim().split(/\s+/)[0] ?? "";
}

export function execInvocation(): string | null {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const js = join(here, "..", "bin", "tkr-exec.js");
    if (!existsSync(js)) return null;
    return `node '${js.replace(/'/g, "'\\''")}'`;
  } catch {
    return null;
  }
}

export function rewrite(cmd: string, exec = "tkr-exec"): string {
  if (cmd.includes("<<")) return cmd;
  // Function definitions: a multi-statement body would get tkr-exec injected into
  // its inner statements (segments split on ; / &&). Fail open — leave unchanged.
  if (FUNC_DEF_ANYWHERE.test(cmd)) return cmd;
  const segs = splitTopLevel(cmd);
  const out: string[] = [];
  for (let s = 0; s < segs.length; s++) {
    const seg = segs[s]!;
    if (seg.kind === "sep") {
      out.push(seg.text);
      continue;
    }
    const trimmed = seg.text.trim();
    if (!trimmed) {
      out.push(seg.text);
      continue;
    }
    const head = firstWord(trimmed);
    const next = segs[s + 1];
    const midPipe = next?.kind === "sep" && (next.text === "|" || next.text === "|&");
    if (
      EXCEPTIONS.has(head) ||
      SHELL_WORDS.has(head) ||
      INTERPRETERS.has(head) ||
      INTERPRETERS.has(basename(head)) ||
      ASSIGN_RE.test(head) ||
      head.startsWith("(") ||
      head.startsWith("#") ||
      head.startsWith("<") ||
      head.startsWith(">") ||
      FUNC_DEF_RE.test(trimmed) ||
      head.endsWith(")") ||
      midPipe ||
      hasTopLevelRedirect(seg.text) ||
      seg.text.includes("<(") ||
      seg.text.includes(">(") ||
      (head === "node" && trimmed.includes("tkr-exec.js"))
    ) {
      out.push(seg.text);
      continue;
    }
    const leading = seg.text.match(/^\s*/)?.[0] ?? "";
    const trailing = seg.text.match(/\s*$/)?.[0] ?? "";
    out.push(`${leading}${exec} ${trimmed}${trailing}`);
  }
  return out.join("");
}

type HookOutput = {
  hookSpecificOutput: {
    hookEventName: "PreToolUse";
    updatedInput: { command: string };
  };
};

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const raw = await readStdin();
  if (!raw) {
    process.exit(0);
  }
  let payload: { tool_input?: { command?: string }; tool_name?: string; session_id?: string };
  try {
    payload = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  if (payload.tool_name !== "Bash") {
    process.exit(0);
  }
  const cmd = payload.tool_input?.command;
  if (!cmd) process.exit(0);
  const exec = execInvocation();
  if (!exec) process.exit(0);
  const rewritten = rewrite(cmd, exec);
  recordUsageSync(payload.session_id ?? "unknown", rewritten !== cmd);
  if (rewritten === cmd) process.exit(0);
  const out: HookOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      updatedInput: { command: rewritten }
    }
  };
  process.stdout.write(JSON.stringify(out));
}

function isEntryModule(entry: string): boolean {
  if (!entry) return false;
  if (import.meta.url === pathToFileURL(entry).href) return true;
  try {
    const here = realpathSync(fileURLToPath(import.meta.url));
    return realpathSync(entry) === here;
  } catch {
    return false;
  }
}

const entry = process.argv[1] ?? "";
if (isEntryModule(entry)) {
  main().catch((err) => {
    process.stderr.write(`tkr pre-tool-use: ${(err as Error).message}\n`);
    process.exit(0);
  });
}
