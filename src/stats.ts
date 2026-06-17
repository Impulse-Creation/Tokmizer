import { readFile, rm } from "node:fs/promises";
import { appendFileSync, chmodSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tokmizerHome } from "./paths";

const STATS_FILE = "stats.jsonl";
const MAX_LINES = 20000;

async function readCappedLines(file: string): Promise<string[]> {
  const raw = await readFile(file, "utf8");
  const lines = raw.split("\n").filter((l) => l.trim() !== "");
  return lines.length > MAX_LINES ? lines.slice(lines.length - MAX_LINES) : lines;
}

export type GainAgg = {
  count: number;
  rawTokens: number;
  filteredTokens: number;
  savedTokens: number;
  savedPct: number;
  sinceDays: number;
};

function statsPath(): string {
  return join(tokmizerHome(), STATS_FILE);
}

export async function clearStats(file = statsPath()): Promise<number> {
  try {
    const raw = await readFile(file, "utf8");
    const n = raw.split("\n").filter((l) => l.trim() !== "").length;
    await rm(file, { force: true });
    return n;
  } catch {
    return 0;
  }
}

export function recordStat(rawBytes: number, filteredBytes: number, file = statsPath()): void {
  if (!(filteredBytes < rawBytes)) return;
  const line = `{"t":${Math.floor(Date.now() / 1000)},"r":${rawBytes},"f":${filteredBytes}}\n`;
  try {
    mkdirSync(tokmizerHome(), { recursive: true, mode: 0o700 });
    appendFileSync(file, line, { mode: 0o600 });
    chmodSync(file, 0o600);
  } catch {
    return;
  }
}

function bytesToTokens(bytes: number): number {
  return Math.ceil(bytes / 4);
}

export async function readGain(file = statsPath(), sinceTs = 0): Promise<GainAgg> {
  let lines: string[];
  try {
    lines = await readCappedLines(file);
  } catch {
    return { count: 0, rawTokens: 0, filteredTokens: 0, savedTokens: 0, savedPct: 0, sinceDays: 1 };
  }

  let count = 0;
  let rawBytes = 0;
  let filteredBytes = 0;
  let earliest = Number.POSITIVE_INFINITY;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const rec = JSON.parse(trimmed) as { t?: unknown; r?: unknown; f?: unknown };
      if (typeof rec.t !== "number" || typeof rec.r !== "number" || typeof rec.f !== "number") {
        continue;
      }
      if (rec.t < sinceTs) continue;
      count += 1;
      rawBytes += rec.r;
      filteredBytes += rec.f;
      if (rec.t < earliest) earliest = rec.t;
    } catch {
      continue;
    }
  }

  const rawTokens = bytesToTokens(rawBytes);
  const filteredTokens = bytesToTokens(filteredBytes);
  const savedTokens = Math.max(0, rawTokens - filteredTokens);
  const savedPct = rawTokens ? Math.round((savedTokens / rawTokens) * 100) : 0;
  const now = Math.floor(Date.now() / 1000);
  const sinceDays = Number.isFinite(earliest)
    ? Math.max(1, Math.ceil((now - earliest) / 86400))
    : 1;

  return { count, rawTokens, filteredTokens, savedTokens, savedPct, sinceDays };
}

export function formatTokens(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

function formatDollars(d: number): string {
  if (d <= 0) return "~$0";
  if (d < 1) return "~$1";
  return "~$" + Math.round(d);
}

function formatCount(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const AMBER = "\x1b[38;2;245;176;65m";
const RESET = "\x1b[0m";
const BAR_WIDTH = 32;

function bar(blocks: number, color: boolean): string {
  const run = "█".repeat(blocks);
  return color ? `${AMBER}${run}${RESET}` : run;
}

export function renderGain(agg: GainAgg, opts: { color: boolean; pricePerMtok: number; subtitle?: string | undefined }): string {
  if (agg.count === 0) {
    return "  No data yet. Run a few commands — tkr counts your savings quietly.";
  }

  const dollars = formatDollars((agg.savedTokens / 1e6) * opts.pricePerMtok);
  const rawLabel = formatTokens(agg.rawTokens) + " tokens";
  const filteredLabel = formatTokens(agg.filteredTokens) + " tokens";

  const sansBlocks = BAR_WIDTH;
  const avecBlocks = agg.rawTokens > 0
    ? Math.max(1, Math.round(BAR_WIDTH * (agg.filteredTokens / agg.rawTokens)))
    : 1;

  const sansPad = " ".repeat(BAR_WIDTH - sansBlocks);
  const avecPad = " ".repeat(BAR_WIDTH - avecBlocks);

  const title = "  tokmizer · your savings";
  const since = opts.subtitle ?? `since install · ${agg.sinceDays}d`;
  const rule = "  " + "─".repeat(61);

  return [
    `${title}${" ".repeat(Math.max(2, 40 - title.length))}${since}`,
    rule,
    "",
    `  ${"Without tokmizer".padEnd(16)}  ${bar(sansBlocks, opts.color)}${sansPad}   ${rawLabel}`,
    `  ${"With tokmizer".padEnd(16)}  ${bar(avecBlocks, opts.color)}${avecPad}   ${filteredLabel}`,
    "",
    `  ${"Saved".padEnd(16)} ${formatTokens(agg.savedTokens)} tokens   ·   ${agg.savedPct} %  less noise`,
    `  ${"In dollars".padEnd(16)} ${dollars}   saved`,
    "",
    `  ${formatCount(agg.count)} commands compressed (only commands with big output compress)`,
    ""
  ].join("\n");
}

export type DayRow = { day: string; count: number; savedTokens: number };

export async function readDaily(file = statsPath(), sinceTs = 0): Promise<DayRow[]> {
  let lines: string[];
  try {
    lines = await readCappedLines(file);
  } catch {
    return [];
  }
  const buckets = new Map<string, { count: number; rawB: number; filtB: number }>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const rec = JSON.parse(trimmed) as { t?: unknown; r?: unknown; f?: unknown };
      if (typeof rec.t !== "number" || typeof rec.r !== "number" || typeof rec.f !== "number") continue;
      if (rec.t < sinceTs) continue;
      const d = new Date(rec.t * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const b = buckets.get(key) ?? { count: 0, rawB: 0, filtB: 0 };
      b.count += 1;
      b.rawB += rec.r;
      b.filtB += rec.f;
      buckets.set(key, b);
    } catch {
      continue;
    }
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([day, b]) => ({
      day,
      count: b.count,
      savedTokens: Math.max(0, bytesToTokens(b.rawB) - bytesToTokens(b.filtB))
    }));
}

export function renderDaily(rows: DayRow[], opts: { color: boolean }): string {
  if (rows.length === 0) return "";
  const fmtRow = (label: string, count: number, saved: number): string =>
    `  ${label.padEnd(11)}${formatCount(count).padStart(4)}${formatTokens(saved).padStart(13)}`;
  const head = "  " + "Day".padEnd(11) + "Cmds".padStart(4) + "Saved".padStart(13);
  const rule = "  " + "─".repeat(31);
  const body = rows.map((r) => fmtRow(`${r.day.slice(8, 10)}/${r.day.slice(5, 7)}`, r.count, r.savedTokens));
  const totCount = rows.reduce((a, r) => a + r.count, 0);
  const totSaved = rows.reduce((a, r) => a + r.savedTokens, 0);
  const totalLine = fmtRow("Total", totCount, totSaved);
  return [head, rule, ...body, rule, opts.color ? `${AMBER}${totalLine}${RESET}` : totalLine, ""].join("\n");
}

export async function readGainPrice(): Promise<number> {
  try {
    const raw = await readFile(join(tokmizerHome(), "settings-cache.json"), "utf8");
    const parsed = JSON.parse(raw) as { gainPricePerMtok?: unknown };
    const v = parsed.gainPricePerMtok;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  } catch {}
  return 3;
}
