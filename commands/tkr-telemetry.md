---
description: Show or change Tokmizer anonymous telemetry (status, on, off, forget).
argument-hint: status | on | off | forget
---

Manage the user's Tokmizer telemetry preference.

Pick the subcommand from the user's request. Default to `status` when they only ask to see it.

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" telemetry status
```

- `telemetry status` shows whether anonymous telemetry is on or off and the local record count.
- `telemetry on` turns it on.
- `telemetry off` turns it off.
- `telemetry forget` erases telemetry data stored on this machine.

Print the output as is. If the user asks what is collected, tell them: anonymous command names and token savings only, never command contents, and the online dashboard at https://tokmizer.com needs telemetry on to show savings.
