<#
.SYNOPSIS
  Tokmizer universal install — Windows (PowerShell 5.1+ / PowerShell 7+)
.DESCRIPTION
  Installs shell shims under $env:USERPROFILE\.tokmizer\shims and prepends
  that directory to the user PATH. Works under any AI CLI/IDE that invokes
  shell (Cursor, Cline, Aider, Gemini CLI, Windsurf, Copilot, cmd, pwsh).
#>

$ErrorActionPreference = "Stop"

function Write-Log([string]$msg) { Write-Host "tkr: $msg" }
function Fail([string]$msg) { Write-Error "tkr install: $msg"; exit 1 }

# Check Node.js 20+
try {
    $nodeMajor = (node -p "process.versions.node.split('.')[0]" 2>$null)
} catch { Fail "Node.js 20+ is required (not found)." }
if ([int]$nodeMajor -lt 20) { Fail "Node.js 20+ required (found v$nodeMajor)." }

Write-Log "Installing @tokmizer/plugin from npm..."
npm install -g @tokmizer/plugin | Out-Null

$home = $env:USERPROFILE
$tokmizerHome = if ($env:TOKMIZER_HOME) { $env:TOKMIZER_HOME } else { Join-Path $home ".tokmizer" }
$shimsDir = Join-Path $tokmizerHome "shims"
New-Item -ItemType Directory -Force -Path $shimsDir | Out-Null

$shimEntry = (Get-Command tkr-shim -ErrorAction SilentlyContinue).Source
if (-not $shimEntry) { Fail "tkr-shim not found on PATH after install." }

Write-Log "Installing shims into $shimsDir..."
$commands = @(
    "git","npm","yarn","pnpm","docker","kubectl","terraform","tofu",
    "cargo","go","mvn","gradle","rg","grep","find","ls","cat","tail",
    "head","ps","lsof","ssh","scp","rsync","curl","wget","jq","yq","make"
)
foreach ($cmd in $commands) {
    $target = Join-Path $shimsDir "$cmd.cmd"
    # Each per-command wrapper hard-codes `--as <cmd>` so the shim runner
    # knows exactly which binary to spawn instead of falling back to the
    # first user arg (which would let attackers plant arbitrary names).
    $content = "@echo off`r`nnode `"$shimEntry`" --as `"$cmd`" %*"
    $content | Set-Content -Encoding ASCII -Path $target -Force
}

# Prepend shims dir to user PATH.
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notmatch [Regex]::Escape($shimsDir)) {
    $newPath = "$shimsDir;$userPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Log "Added $shimsDir to user PATH."
} else {
    Write-Log "Shim PATH already present in user PATH."
}

# PowerShell profile — update for current session and future sessions.
$profilePath = $PROFILE.CurrentUserAllHosts
$marker = "# tokmizer-shim PATH (managed by tokmizer)"
if (-not (Test-Path $profilePath)) {
    New-Item -ItemType File -Force -Path $profilePath | Out-Null
}
$profileContent = Get-Content -Raw -Path $profilePath -ErrorAction SilentlyContinue
if ($null -eq $profileContent -or -not $profileContent.Contains($marker)) {
    Add-Content -Path $profilePath -Value "`r`n$marker`r`n`$env:Path = `"$shimsDir;`" + `$env:Path"
    Write-Log "Added shim line to PowerShell profile: $profilePath"
}

Write-Log "Done. Open a new terminal — optimization starts automatically. Run 'tkr link' to connect a paid account."
