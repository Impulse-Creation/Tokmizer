<p align="center">
  <h1 align="center">Tokmizer</h1>
</p>

<p align="center">
  <b>91% fewer tokens on your command output. No setup. No loss of signal.</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tokmizer/plugin"><img src="https://img.shields.io/npm/v/@tokmizer/plugin?color=f5b041&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@tokmizer/plugin"><img src="https://img.shields.io/npm/dt/@tokmizer/plugin?color=f5b041&label=downloads" alt="npm downloads"></a>
  <img src="https://img.shields.io/badge/reduction-91%25%20avg-f5b041" alt="reduction">
  <img src="https://img.shields.io/badge/license-Proprietary-red" alt="license">
  <img src="https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white" alt="node">
  <a href="https://tokmizer.com"><img src="https://img.shields.io/badge/web-tokmizer.com-f5b041" alt="website"></a>
</p>

<p align="center">
  Works with <b>Claude Code</b>, <b>Codex</b>, <b>Cursor</b>, <b>Aider</b>, <b>Gemini CLI</b>, <b>Cline</b>, <b>Windsurf</b> and <b>Copilot</b>.
</p>

---

## The problem

Your AI agent spends most of its context window reading the raw output of the commands it runs. Build logs, test runs, `git status`, dependency trees, JSON dumps. Most of that is noise. You pay for every token of it, on every turn, in every session.

Tokmizer sits quietly between the agent and that output. It keeps the part the agent needs to act (errors, results, what changed) and drops the part it does not (progress spam, banners, repeated rows). Same answers, far fewer tokens.

## The numbers

| Metric | Value |
| :-- | :-- |
| Average reduction | **91%** on real command output |
| Fabricated results | **zero**. A failed command always reads as failed |
| Signal kept | **100%** of errors, results and changes |
| AI agents supported | **8**, plus any plain shell |
| Setup time | **about 30 seconds** |
| Config required | **none**. On by default |

## Token savings by command

Real output, measured. Numbers shown in tokens.

| Command | Before | After | Reduction |
| :-- | --: | --: | --: |
| `cargo build` | 53,914 | 44 | **99%** |
| `pytest` | 66,023 | 5 | **99%** |
| `git log` | 41,798 | 1,279 | **97%** |
| `npm install` | 42,192 | 1,428 | **97%** |
| `kubectl` | 33,331 | 1,144 | **97%** |
| `ls -la` | 2,344 | 127 | **95%** |
| `read` | 1,070 | 81 | **92%** |
| `prisma` | 11,540 | 1,749 | **85%** |
| `git diff` | 3,512 | 856 | **76%** |
| `grep` | 5,669 | 1,960 | **65%** |
| `find` | 1,951 | 833 | **57%** |
| **Total** | **263,344** | **9,506** | **96%** |

> Other tools chase bigger numbers by deleting or inventing output. Tokmizer is built the other way around. It compresses hard, but it never hides an error and it never makes one up.

## Before and after

What your agent reads from a noisy test run.

**Before** (raw, hundreds of lines, tens of thousands of tokens)

```
PASS  src/a.test.ts (1.2 s)
PASS  src/b.test.ts (0.9 s)
PASS  src/c.test.ts (1.1 s)
  ... 300 more passing lines ...
FAIL  src/payments.test.ts
  expected 200, received 500
PASS  src/d.test.ts
  ... 60 more passing lines ...
```

**After** (what Tokmizer hands the model)

```
FAIL src/payments.test.ts
  expected 200, received 500
303 passed, 1 failed
```

The one thing that matters survives. The noise does not.

## Install

**macOS and Linux**

```bash
bash scripts/install-mac-linux.sh
```

**Windows (PowerShell)**

```powershell
./scripts/install-windows.ps1
```

**npm**

```bash
npm install -g @tokmizer/plugin
```

Then restart your AI tool. See [`scripts/README-INSTALL.md`](scripts/README-INSTALL.md) for host notes (native hooks for Claude Code and Codex, a universal shim for everything else).

## Commands

Run these from your agent.

| Command | What it does |
| :-- | :-- |
| `/tkr-gain` | How many tokens and dollars Tokmizer has saved you |
| `/tkr-status` | Your plan and token state |
| `/tkr` | Manage settings (verbosity, on or off, telemetry opt in) |
| `/tkr-link` | Attach a paid plan |
| `/tkr-unlink` | Unlink this machine from your account |
| `/tkr-compression` | Pick the compression level (light, balanced, max) |
| `/tkr-reducer` | Make the assistant's replies shorter (off, light, balanced, max). Smart and Pro |
| `/tkr-telemetry` | View or change anonymous telemetry |
| `/tkr-update` | Update to the latest version |

Example of the savings view.

```
  tokmizer · your savings                  since install · 14d
  ─────────────────────────────────────────────────────────────

  Without tokmizer  ████████████████████████████████   6.2M tokens
  With tokmizer     ███                                 540K tokens

  Saved            5.7M tokens   ·   91 %  less noise
  In dollars       ~$17   saved

  1,240 commands optimized
```

## Compression levels

Three levels, one command. Your choice syncs across your machines and applies to your next commands.

```
tkr compression balanced
```

### `light`

Gentle: every command output goes through its standard cleanup only. Pick it if you want the lightest touch.

```
$ git status
2 files modified · src/app.ts, src/lib/db.ts
1 untracked · notes.md
(+ 243 cache files ignored)
```

Test it: `tkr compression light`, then run `git status` in a busy repo.

### `balanced` (default)

Everything `light` does, plus repeated lines collapse into a counter and blank-line runs squeeze down. Great for build logs, test runners and loops. This is the default.

```
Before                              After (balanced)
─────────────────────────           ─────────────────────────
processing item 4                   processing item 4
processing item 4                     … (repeated 4x)
processing item 4                   done: 12 files
processing item 4
done: 12 files
```

Test it: `tkr compression balanced`, then run a command with repetitive output, e.g. `seq 1 500 | awk '{print "tick " $1 % 3}'`.

### `max`

Everything `balanced` does, plus verbose log chatter (debug and info noise) is dropped. Warnings, errors and results always stay.

```
Before                              After (max)
─────────────────────────           ─────────────────────────
DEBUG fetching page 1               ERROR timeout on page 3
DEBUG fetching page 2               3 pages fetched
ERROR timeout on page 3
INFO retry scheduled
3 pages fetched
```

Test it: `tkr compression max`, then run your noisiest build or test command and compare with `tkr gain --day`.

Whatever the level, failed commands always show their full output, and unknown commands pass through untouched. You never lose the signal.

## Response reducer (Smart and Pro)

Compression cleans what your commands send to the model. The reducer works on the other side: it makes the assistant's own replies shorter, at the level you pick.

```
tkr reducer balanced
```

- `off` (default): replies untouched
- `light`: trims padding, keeps natural prose
- `balanced`: dense and direct, answer first
- `max`: telegraphic, every token earns its place

### `light`

Keeps full sentences and natural prose, removes everything that adds no information: preambles, recaps, hedging, decorative filler.

Before:

> I've taken a look at your test suite, and it seems like the failure is probably caused by the fact that the database container isn't fully ready when the first test starts running.

After:

> The first test starts before the database container is ready. That's the failure.

Test it: `tkr reducer light`, then ask your assistant to explain a bug.

### `balanced`

Short, dense sentences. The answer comes first, context only when it changes what you do next.

Before:

> After looking into it, the endpoint returns a 404 because the route file was renamed during the refactor but the client is still calling the old path.

After:

> 404 cause: route file renamed, client still calls the old path. Update the client path.

Test it: `tkr reducer balanced`, then ask for a diagnosis on any failing command.

### `max`

Telegraphic. Every token earns its place, and a skim of the first two lines gives you the full decision.

Before:

> The build is failing because the lockfile is out of sync with package.json after the last dependency bump, so you'll want to reinstall and commit the updated lockfile.

After:

> Build fails: lockfile out of sync after dep bump -> npm install, commit lockfile.

Test it: `tkr reducer max`, then compare the length of the replies with `tkr reducer off`.

Whatever the level: same substance, fewer tokens. Code, errors and security content always stay intact, word for word. Takes full effect at the next session. Also available as `/tkr-reducer`.

## Supported agents

| Agent | Integration |
| :-- | :-- |
| Claude Code | Native hooks |
| Codex | Native hooks |
| Cursor | Universal shim |
| Aider | Universal shim |
| Gemini CLI | Universal shim |
| Cline | Universal shim |
| Windsurf | Universal shim |
| Copilot | Universal shim |
| Any shell | Universal shim |

## How it works

1. **It watches command output**, not your code or your prompts.
2. **It keeps the signal and drops the noise**, with fidelity first. If a command failed, you see it failed. Nothing is invented.
3. **Secrets never leak**. Credentials in command lines and output are redacted before anything is stored or sent.

The compression engine itself is proprietary and is not part of this repository.

## Plans

Tokmizer is free on every device, with no account and no sign up. Paid plans add more. Pricing and account management live at [tokmizer.com](https://tokmizer.com/#pricing).

## Privacy

Tokmizer is quiet by default and runs on your machine. It reads command output to compress it, redacts credentials before anything leaves your device, and sends usage data only if you opt in.

## Links

- Website and pricing, [tokmizer.com](https://tokmizer.com)
- npm package, [@tokmizer/plugin](https://www.npmjs.com/package/@tokmizer/plugin)
- Changelog, [CHANGELOG.md](CHANGELOG.md)

---

<p align="center">
  This repository is the public showcase for the Tokmizer plugin, free tier.<br>
  The compression engine is proprietary and stays private.<br>
  Released under a proprietary license. See <a href="LICENSE">LICENSE</a>.
</p>
