---
description: Manage Tokmizer plugin settings (show, set, reset).
argument-hint: [show | set <key> <value> | reset]
---

Use the bundled CLI. Define it once in your shell call:

```bash
TKR="node \"${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js\""
```

Every `tkr ...` below means `eval "$TKR ..."` (or `node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" ...` directly). The bare `tkr` binary is only on PATH when the user also installed the npm package globally, never assume it.

You are about to manage the Tokmizer plugin settings via its CLI.

If the user invoked `/tkr` with no extra args, run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" settings show
```

If the user asked to "configure", "set up", "redo onboarding", "personalize", or seems unsure of the settings, run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" settings configure
```

The configure wizard offers Recommended (sane defaults) or Custom (walk through each option). It runs once at the end of the interactive `tkr link` setup, and can be re-run anytime with `tkr settings configure`.

If the user asked to change a setting (e.g. "set output to compact", "disable git filter"), translate the request to one or more `tkr settings set <key> <value>` calls.

Valid keys:

- `enabled` (boolean) — master on/off
- `telemetryOptIn` (boolean) — required true to send any usage data
- `outputVerbosity` (`normal` | `compact` | `minimal`)
- `filters.enableAll` (boolean)
- `filters.disabled` (JSON array of slug strings, e.g. `["git","grep"]`)

After any change, run `tkr settings show` and print the result.

Changes sync to all the user's machines instantly.
