import { appendFileSync, chmodSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tokmizerHome } from "./paths";

const USAGE_FILE = "usage.jsonl";
const MAX_LINES = 20000;

function usagePath(): string {
  return join(tokmizerHome(), USAGE_FILE);
}

export function recordUsageSync(sessionId: string, routed: boolean, file = usagePath()): void {
  try {
    const dir = dirname(file);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
    const s = sessionId.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 64) || "unknown";
    appendFileSync(file, `{"t":${Math.floor(Date.now() / 1000)},"s":"${s}","o":${routed ? 1 : 0}}\n`, { mode: 0o600 });
    chmodSync(file, 0o600);
  } catch {}
}

export function clearUsage(file = usagePath()): number {
  try {
    if (!existsSync(file)) return 0;
    const n = readFileSync(file, "utf8").split("\n").filter((l) => l.trim() !== "").length;
    rmSync(file, { force: true });
    return n;
  } catch {
    return 0;
  }
}

export type SessionAgg = { sessionId: string | null; total: number; routed: number; pct: number };

type UsageRec = { s: string; o: number };

function parseUsageLine(line: string): UsageRec | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const r = JSON.parse(trimmed) as { t?: unknown; s?: unknown; o?: unknown };
    if (typeof r.t !== "number" || typeof r.s !== "string" || typeof r.o !== "number") return null;
    return { s: r.s, o: r.o };
  } catch {
    return null;
  }
}

export function readSession(file = usagePath()): SessionAgg {
  let lines: string[];
  try {
    lines = readFileSync(file, "utf8").split("\n").filter((l) => l.trim() !== "");
  } catch {
    return { sessionId: null, total: 0, routed: 0, pct: 0 };
  }

  if (lines.length > MAX_LINES) {
    lines = lines.slice(lines.length - MAX_LINES);
  }

  let latestId: string | null = null;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const rec = parseUsageLine(lines[i] ?? "");
    if (rec) {
      latestId = rec.s;
      break;
    }
  }
  if (latestId === null) return { sessionId: null, total: 0, routed: 0, pct: 0 };

  let total = 0;
  let routed = 0;
  for (const line of lines) {
    const rec = parseUsageLine(line);
    if (!rec || rec.s !== latestId) continue;
    total += 1;
    if (rec.o === 1) routed += 1;
  }
  return { sessionId: latestId, total, routed, pct: total ? Math.round((routed / total) * 100) : 0 };
}

export function renderSession(s: SessionAgg): string {
  if (s.total === 0) return "  No commands yet this session.";
  return [
    "  This session",
    "  " + "─".repeat(40),
    `  ${s.total} commands · ${s.routed} handled by tkr  (${s.pct} %)`,
    "  The rest (cd, echo…) has nothing to optimize.",
    ""
  ].join("\n");
}
