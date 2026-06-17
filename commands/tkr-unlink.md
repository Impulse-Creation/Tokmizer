---
description: Unlink this machine from your Tokmizer account (back to free tier).
---

Unlink the local plugin from the user's Tokmizer account.

Run the bundled CLI:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" unlink
```

Print the output as is. After unlinking, the plugin falls back to the free tier and a fresh anonymous token starts on the next online run. To link another account, the user runs `tkr link` with the key from their dashboard.
