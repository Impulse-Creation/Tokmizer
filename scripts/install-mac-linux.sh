#!/usr/bin/env bash
set -euo pipefail

#
# tokmizer universal install — macOS + Linux
# Installs shell shims under ~/.tokmizer/shims and adds it to PATH.
# Works under any AI CLI/IDE that invokes shell (Cursor, Cline, Aider,
# Gemini CLI, Windsurf, Copilot, plain shell). Native hooks are preferred
# for Claude Code and Codex (see those plugin manifests separately).
#

TOKMIZER_HOME="${TOKMIZER_HOME:-$HOME/.tokmizer}"
SHIMS_DIR="$TOKMIZER_HOME/shims"

err() { printf 'tkr install: %s\n' "$*" >&2; exit 1; }
log() { printf 'tkr: %s\n' "$*"; }

command -v node >/dev/null 2>&1 || err "Node.js 20+ is required."
command -v npm  >/dev/null 2>&1 || err "npm is required."

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || err "Node.js 20+ required (found v$NODE_MAJOR)."

log "Installing @tokmizer/plugin from npm..."
npm install -g @tokmizer/plugin >/dev/null

mkdir -p "$SHIMS_DIR"

SHIM_ENTRY="$(command -v tkr-shim || true)"
[ -n "$SHIM_ENTRY" ] || err "tkr-shim not found on PATH after install."

log "Installing shims into $SHIMS_DIR..."
tkr link --shim --shim-runner "$SHIM_ENTRY" </dev/null || true

# Fallback: directly symlink commands if the wizard didn't.
COMMANDS="git npm yarn pnpm docker kubectl terraform tofu cargo go mvn gradle rg grep find ls cat tail head ps lsof ssh scp rsync curl wget jq yq make"
for cmd in $COMMANDS; do
  target="$SHIMS_DIR/$cmd"
  if [ ! -e "$target" ]; then
    ln -sf "$SHIM_ENTRY" "$target"
    chmod +x "$target" || true
  fi
done

# Detect the user's interactive shell rc file.
RC=""
case "${SHELL:-}" in
  */zsh)  RC="$HOME/.zshrc" ;;
  */bash) RC="$HOME/.bashrc" ;;
  */fish) RC="$HOME/.config/fish/config.fish" ;;
  *)      RC="$HOME/.profile" ;;
esac

MARKER="# tokmizer-shim PATH (managed by tokmizer)"
if [ -f "$RC" ] && ! grep -Fq "$MARKER" "$RC"; then
  {
    printf '\n%s\n' "$MARKER"
    if [[ "$RC" == *fish* ]]; then
      printf 'set -gx PATH %s $PATH\n' "$SHIMS_DIR"
    else
      printf 'export PATH="%s:$PATH"\n' "$SHIMS_DIR"
    fi
  } >> "$RC"
  log "Added shim PATH to $RC"
else
  log "Shim PATH already present (or rc file missing): $RC"
fi

log "Done. Open a new terminal — optimization starts automatically. Run 'tkr link' to connect a paid account."
