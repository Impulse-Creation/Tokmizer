---
description: Show your Tokmizer plan, token state and features.
---

Show the user their Tokmizer account status.

Run the bundled CLI:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" status
```

Print the output as is. It includes the plan, the token state and whether `/power` is available right now.

If the user is on the free plan and asks how to upgrade, point them to https://tokmizer.com/#pricing and the `/tkr-link` command.
