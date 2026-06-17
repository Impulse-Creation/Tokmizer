---
description: Link a paid Tokmizer account. Usage - /tkr-link tokmizer_yourkey
argument-hint: tokmizer_yourkey
---

The user invoked /tkr-link with: $ARGUMENTS

If $ARGUMENTS contains a value starting with `tokmizer_`, run it immediately, nothing else to ask:

```bash
node "${CLAUDE_PLUGIN_ROOT}/dist/bin/tkr.js" link <that value>
```

On success the command prints the active plan. Tell the user it is done.

If $ARGUMENTS contains no `tokmizer_...` value, do not run anything and reply exactly:

> Put your key in the command: `/tkr-link tokmizer_yourkey`. Your key is at https://tokmizer.com/dashboard/token.

Never ask for an email. Never echo the key back or store it anywhere else.
