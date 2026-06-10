---
description: Show or change the Tokmizer response reducer (off, light, balanced, max). Smart/Pro.
argument-hint: off | light | balanced | max
---

Manage the user's Tokmizer reducer level. The reducer shortens the assistant's replies (style discipline), it does not touch command output compression.

If the user already named a level in their request (off, light, balanced or max), apply it directly. Otherwise, first show the current level:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" reducer
```

Then ask the user to pick a level using the AskUserQuestion tool (single choice, four options):

- `off` — default: responses untouched
- `light` — trims padding, keeps natural prose
- `balanced` — dense and direct, answer first
- `max` — telegraphic, every token earns its place

Mark the current level in the option labels (e.g. "off (current)"). After they pick, apply it:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" reducer <level>
```

Print the output as is. The level syncs to all the user's machines and takes full effect at the next session. If the command reports the feature is Smart/Pro only, relay that message without improvising a replacement style.
