---
description: Update the Tokmizer plugin to the latest version.
---

Update the Tokmizer plugin. Run this exactly:

```bash
MKT="$HOME/.claude/plugins/marketplaces/tokmizer"
if [ -d "$MKT/.git" ]; then git -C "$MKT" fetch origin --quiet && git -C "$MKT" reset --hard origin/main --quiet; fi
claude plugin update tokmizer@tokmizer
```

The first two lines realign the local marketplace clone with the published
catalog before updating. This is what makes the update reliable: a clone can
drift out of sync and then plain updates keep reporting "already latest" even
when a newer version exists, so we hard-reset it to the published state first.

Print the result line.

- If it updated, tell the user to run /reload-plugins (or restart Claude Code) to apply.
- If it says already at the latest version, just say so.
- If the `claude` binary is unavailable, tell the user to run the same commands in their terminal.
