import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";

const home = process.env.TOKMIZER_HOME || join(homedir(), ".tokmizer");

try {
  const onboardFile = join(home, "onboarded");
  if (!existsSync(onboardFile)) {
    console.log(
      "Tokmizer is on with the recommended settings. Free tier, no account needed.\n" +
        "Pick your own experience anytime: run 'tkr settings configure' in a terminal.\n" +
        "Paid plan? Link it with 'tkr link'."
    );
    mkdirSync(home, { recursive: true });
    writeFileSync(onboardFile, String(Date.now()));
  }
} catch {}

try {
  const onboardFile = join(home, "onboarded");
  const shimNudge = join(home, "shim-nudge");
  const shimsDir = join(home, "shims");
  if (existsSync(onboardFile) && !existsSync(shimNudge) && !existsSync(shimsDir)) {
    const onboardedAt = Number(readFileSync(onboardFile, "utf8")) || 0;
    if (onboardedAt > 0 && Date.now() - onboardedAt >= 24 * 60 * 60 * 1000) {
      console.log(
        "Tokmizer covers this agent. Your other terminals and sub-agents are not covered yet. " +
          "One command fixes that: tkr shim install"
      );
      writeFileSync(shimNudge, String(Date.now()));
    }
  }
} catch {}

try {
  const onboardFile = join(home, "onboarded");
  const nudgeFile = join(home, "value-nudge");
  if (existsSync(onboardFile) && !existsSync(nudgeFile)) {
    const onboardedAt = Number(readFileSync(onboardFile, "utf8")) || 0;
    if (onboardedAt > 0 && Date.now() - onboardedAt >= 60 * 60 * 1000 && existsSync(join(home, "stats.jsonl"))) {
      let rawB = 0;
      let filtB = 0;
      for (const line of readFileSync(join(home, "stats.jsonl"), "utf8").split("\n")) {
        if (!line.trim()) continue;
        try {
          const rec = JSON.parse(line);
          if (typeof rec.r === "number" && typeof rec.f === "number") {
            rawB += rec.r;
            filtB += rec.f;
          }
        } catch {}
      }
      const saved = Math.max(0, Math.ceil(rawB / 4) - Math.ceil(filtB / 4));
      if (saved >= 1000) {
        const label = saved >= 1e6 ? (saved / 1e6).toFixed(1) + "M" : saved >= 1e3 ? (saved / 1e3).toFixed(1) + "K" : String(saved);
        console.log(`Tokmizer has already saved you ~${label} tokens since install. Details: /tkr-gain`);
        writeFileSync(nudgeFile, String(Date.now()));
      }
    }
  }
} catch {}

try {
  const here = dirname(fileURLToPath(import.meta.url));
  const manifest = JSON.parse(readFileSync(join(here, "..", ".claude-plugin", "plugin.json"), "utf8"));
  const state = JSON.parse(readFileSync(join(home, "state.json"), "utf8"));
  const latest = state.latestPluginVersion;
  if (latest && manifest.version && latest !== manifest.version) {
    const nudgeFile = join(home, `update-nudge-${latest}`);
    if (!existsSync(nudgeFile)) {
      console.log(`Tokmizer ${latest} is available. Update with: /tkr-update`);
      writeFileSync(nudgeFile, String(Date.now()));
    }
  }
} catch {}

try {
  const stateFile = join(home, "state.json");
  const throttleFile = join(home, "last-auto-heartbeat");
  const THROTTLE_MS = 6 * 60 * 60 * 1000;

  let last = 0;
  try {
    last = Number(readFileSync(throttleFile, "utf8")) || 0;
  } catch {}

  if (existsSync(stateFile) && Date.now() - last >= THROTTLE_MS) {
    try {
      writeFileSync(throttleFile, String(Date.now()));
    } catch {}
    const here = dirname(fileURLToPath(import.meta.url));
    const tkr = join(here, "..", "dist", "bin", "tkr.js");
    const child = spawn(process.execPath, [tkr, "heartbeat"], {
      detached: true,
      stdio: "ignore"
    });
    child.unref();
  }
} catch {}
