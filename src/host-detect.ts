export type Host =
  | "claude-code"
  | "codex"
  | "cursor"
  | "cline"
  | "aider"
  | "gemini-cli"
  | "windsurf"
  | "copilot"
  | "shell";

export type HostInfo = {
  host: Host;
  source: "env" | "argv" | "fallback";
  os: "darwin" | "linux" | "win32" | "other";
  arch: string;
  shimRecommended: boolean;
};

const ENV_PROBES: { host: Host; vars: string[] }[] = [
  { host: "claude-code", vars: ["CLAUDE_CODE", "CLAUDE_CODE_VERSION", "ANTHROPIC_CLAUDE_CODE"] },
  { host: "codex", vars: ["CODEX_VERSION", "CODEX_CLI", "OPENAI_CODEX"] },
  { host: "cursor", vars: ["CURSOR_VERSION", "CURSOR_TRACE_ID"] },
  { host: "cline", vars: ["CLINE_VERSION", "CLINE_API_KEY"] },
  { host: "aider", vars: ["AIDER_VERSION", "AIDER_MODEL"] },
  { host: "gemini-cli", vars: ["GEMINI_CLI_VERSION", "GEMINI_API_KEY"] },
  { host: "windsurf", vars: ["WINDSURF_VERSION", "WINDSURF_USER"] },
  { host: "copilot", vars: ["GITHUB_COPILOT_VERSION", "COPILOT_INTEGRATION_ID"] }
];

const HOSTS_WITH_NATIVE_HOOKS = new Set<Host>(["claude-code", "codex"]);

export function detectHost(env: NodeJS.ProcessEnv = process.env): HostInfo {
  const platform = process.platform;
  const os: HostInfo["os"] =
    platform === "darwin" || platform === "linux" || platform === "win32" ? platform : "other";
  const arch = process.arch;

  for (const probe of ENV_PROBES) {
    if (probe.vars.some((v) => env[v])) {
      return {
        host: probe.host,
        source: "env",
        os,
        arch,
        shimRecommended: !HOSTS_WITH_NATIVE_HOOKS.has(probe.host)
      };
    }
  }

  return { host: "shell", source: "fallback", os, arch, shimRecommended: true };
}

export function detectHostFromArgv(argv: string[]): Host | null {
  const idx = argv.findIndex((a) => a === "--host");
  if (idx >= 0 && argv[idx + 1]) {
    const v = argv[idx + 1];
    const valid: Host[] = [
      "claude-code",
      "codex",
      "cursor",
      "cline",
      "aider",
      "gemini-cli",
      "windsurf",
      "copilot",
      "shell"
    ];
    if (valid.includes(v as Host)) return v as Host;
  }
  return null;
}

export function adapterFor(host: Host): "native-hooks" | "shell-shim" {
  return HOSTS_WITH_NATIVE_HOOKS.has(host) ? "native-hooks" : "shell-shim";
}
