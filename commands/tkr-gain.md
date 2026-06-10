---
description: Show how many tokens and dollars Tokmizer saved you.
argument-hint: [--day | --week]
---

Show the user their Tokmizer savings.

Run the bundled CLI:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" gain
```

Print the output as is. If the user asks for today only or this session, run `session` instead of `gain`.

If the output shows zero activity, tell the user the savings build up as they keep working and there is nothing to configure.
