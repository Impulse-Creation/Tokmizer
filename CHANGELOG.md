# Changelog

All notable user-facing changes to the Tokmizer plugin.

## 0.5.2

- Reducer savings now count: each shortened reply is credited (estimated by
  level) in your online dashboard alongside command compression.

## 0.5.1

- Documentation refresh: before/after examples for every reducer level, on
  npm, the site docs and this repository.

## 0.5.0

- New response reducer (Smart and Pro): `tkr reducer off|light|balanced|max`
  makes the assistant's replies shorter at the level you pick. Same substance,
  fewer tokens. Code, errors and security content always stay intact. Also
  available as `/tkr-reducer`.

## 0.4.5

- Maintenance release: every install now lands on the same current build, with
  the reliable `/tkr-update` and the `tkr telemetry` command.

## 0.4.2

- `/tkr-update` now reliably installs the newest version instead of sometimes
  reporting "already up to date" when an update is available.

## 0.4.1

- New `tkr telemetry` command: check status, turn it on or off, or erase the
  telemetry stored on your machine.
- Telemetry is on by default so your online dashboard shows your savings right
  away. Only command names are ever sent, never your code, and you can turn it
  off anytime with `tkr telemetry off`.
- Plan changes and paid features sync on their own in the background.

## 0.4.0

- Output compression tuned for higher fidelity: long values (tokens, URLs, paths) are
  kept whole instead of being truncated; directory diffs, PR descriptions and commit
  logs keep the detail an agent needs to act.
- Stronger credential redaction across command lines and captured output.
- Faster, lighter: lower memory use and buffered output on large logs.
- Multi-host support: Claude Code and Codex via native hooks; other agents and plain
  shells via the universal shim.

## Earlier

- Free tier on every device, no account required.
- `/tkr-gain`, `/tkr-status`, `/tkr`, `/tkr-link`, `/tkr-update` commands.
- Quiet-by-default operation with recommended settings.
