# Installing Tokmizer on any AI coding tool

Tokmizer works with **Claude Code, OpenAI Codex, Cursor, Cline, Aider, Gemini CLI, Windsurf, and GitHub Copilot** — on **macOS, Linux, and Windows**.

For Claude Code and Codex, Tokmizer uses native hook APIs. For every other tool, it uses a universal **shell-shim**: a thin wrapper on common commands (`git`, `npm`, `docker`, etc.) that compresses output before it reaches the model. Because the shim sits on PATH, it works regardless of which IDE or CLI invokes the command.

## macOS / Linux

```bash
curl -fsSL https://tokmizer.com/install.sh | bash
# or
bash scripts/install-mac-linux.sh
```

## Windows (PowerShell)

```powershell
iwr -useb https://tokmizer.com/install.ps1 | iex
# or
PowerShell -ExecutionPolicy Bypass -File scripts\install-windows.ps1
```

## Per-tool notes

| Tool          | Adapter         | Setup                                                          |
|---------------|-----------------|----------------------------------------------------------------|
| Claude Code   | Native hooks    | `/plugin marketplace add Impulse-Creation/Tokmizer` then `/plugin install tokmizer@tokmizer` |
| Codex CLI     | Native hook     | `curl -fsSL https://tokmizer.com/install.sh \| bash`           |
| Cursor        | Shell-shim      | Open a new terminal after install.                             |
| Cline         | Shell-shim      | Open a new terminal after install.                             |
| Aider         | Shell-shim      | Open a new terminal after install.                             |
| Gemini CLI    | Shell-shim      | Open a new terminal after install.                             |
| Windsurf      | Shell-shim      | Open a new terminal after install.                             |
| GitHub Copilot| Shell-shim      | Open a new terminal after install.                             |
| Plain shell   | Shell-shim      | Works out of the box.                                          |

After install, optimization starts automatically. Run `tkr link` to connect a paid account.
