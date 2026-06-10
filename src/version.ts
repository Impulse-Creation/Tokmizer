import { createRequire } from "node:module";

const req = createRequire(import.meta.url);

function resolveVersion(): string {
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const v = req(rel).version;
      if (typeof v === "string" && v) return v;
    } catch {}
  }
  return "0.0.0";
}

export const PLUGIN_VERSION = resolveVersion();
