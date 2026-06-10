---
description: Show or change the Tokmizer compression level (light, balanced, max).
argument-hint: light | balanced | max
---

Manage the user's Tokmizer compression level.

If the user already named a level in their request (light, balanced or max), apply it directly. Otherwise, first show the current level:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" compression
```

Then ask the user to pick a level using the AskUserQuestion tool (single choice, three options):

- `light` — gentle: standard cleanup only
- `balanced` — default: also collapses repeated output and blank runs
- `max` — strongest: also drops verbose log noise (errors and results always stay)

Mark the current level in the option labels (e.g. "balanced (current)"). After they pick, apply it:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" compression <level>
```

Print the output as is. The change syncs to all the user's machines and applies to their next commands. Whatever the level, failed commands keep their full output.
