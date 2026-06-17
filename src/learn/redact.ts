const PATTERNS: Array<[RegExp, string]> = [
  [/(authorization\s*:\s*)([A-Za-z][A-Za-z0-9._-]*)\s+[^\s'"]+/gi, "$1$2 [REDACTED]"],
  [/(authorization\s*:\s*)[A-Za-z0-9._\-+/=]{8,}/gi, "$1[REDACTED]"],
  [/(bearer\s+)[A-Za-z0-9._\-+/=]{8,}/gi, "$1[REDACTED]"],
  [/((?:^|\s)(?:-b|--cookie)[=\s]+['"]?)[^\s'";=]+=[^\s'";]+(?:\s*;\s*[^\s'";=]+=[^\s'";]+)*/gi, "$1[REDACTED]"],
  [/((?:^|[\s'"])(?:Set-)?Cookie\s*:\s*)[^\s'";=]+=[^\s'";]+(?:\s*;\s*[^\s'";=]+=[^\s'";]+)*/gi, "$1[REDACTED]"],
  [/(--?(?:password|passwd|passphrase|apipass|pass|pwd|token|api[-_]?key|secret|bearer|cookie|jwt)(?:-[a-z0-9]+)*[=\s]+)\S+/gi, "$1[REDACTED]"],
  [/((?:^|\s)-b[=\s]?['"]?)[^\s'"=]+=[^\s'"]+/gi, "$1[REDACTED]"],
  [/((?:^|\s)(?:-u[=\s]?|(?:--user|-a)[=\s])['"]?[^\s:/'"]*:)(\/[^/\s'"][^\s'"]*|[^\s/'"0-9][^\s'"]*|[0-9][^\s'"]*[^\s'"0-9][^\s'"]*)/gi, "$1[REDACTED]"],
  [/((?:^|\s)(?:-u[=\s]?|(?:--user|-a)[=\s])['"]?[^\s:/'"]*[^\s:/'"0-9][^\s:/'"]*:)(?:\/[^/\s'"]|[^\s/'"])[^\s'"]*/gi, "$1[REDACTED]"],
  [/((?:^|\s)(?:-u[=\s]?|(?:--user|-a)[=\s])['"]?:)(?:\/[^/\s'"]|[^\s/'"])[^\s'"]*/gi, "$1[REDACTED]"],
  [/((?:[A-Za-z0-9]+-)*(?:X-Api-Key|Private-Token|[A-Za-z0-9]+-(?:Token|Key|Auth|Secret))\s*:\s*)[^\s'"]+/gi, "$1[REDACTED]"],
  [/((?:^|[\s'"])(?:Set-)?Cookie\s*:\s*)[^\s'"]+/gi, "$1[REDACTED]"],
  [/(-i\s+)(\/[^\s]+|~\/[^\s]+|[A-Z]:\\[^\s]+)/g, "$1[REDACTED]"],
  [/([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^:/\s@]*:)[^\s]+(@[^@/\s]+)/g, "$1[REDACTED]$2"],
  [/(AWS_(?:ACCESS_KEY_ID|SECRET_ACCESS_KEY|SESSION_TOKEN)\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/(GOOGLE_APPLICATION_CREDENTIALS\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/(AZURE_(?:CLIENT_SECRET|TENANT_ID|CLIENT_ID)\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/(sk-(?:proj-)?[A-Za-z0-9_-]{20,})/g, "sk-[REDACTED]"],
  [/\b(OPENAI_API_KEY\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/\b(ANTHROPIC_API_KEY\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/(sk-ant-[A-Za-z0-9_-]{20,})/g, "sk-ant-[REDACTED]"],
  [/\b(GH(?:_|ITHUB_)?TOKEN\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/\b(GITLAB_TOKEN\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/\b(SLACK_(?:BOT_)?TOKEN\s*=\s*)\S+/g, "$1[REDACTED]"],
  [/(xox[bpsoa]-[A-Za-z0-9-]{10,})/g, "xox[REDACTED]"],
  [/(xapp-[A-Za-z0-9-]{10,})/g, "[REDACTED]"],
  [/(sk_(?:test|live)_[A-Za-z0-9]{16,})/g, "sk_[REDACTED]"],
  [/(gh[a-z])_[A-Za-z0-9]{20,}/g, "$1_[REDACTED]"],
  [/(github_pat)_[A-Za-z0-9_]{20,}/g, "$1_[REDACTED]"],
  [/(gl(?:pat|rt|soat|imt|dt|ft|agent|oas|cbt|ptt))-[A-Za-z0-9_-]{16,}/g, "$1-[REDACTED]"],
  [/(npm_[A-Za-z0-9_-]{20,})/g, "npm_[REDACTED]"],
  [/(?:AKIA|ASIA|AGPA|AIDA|AROA|ANPA)[0-9A-Z]{16,}/g, "[REDACTED_AWS_KEY]"],
  [/AIza[A-Za-z0-9_-]{35}/g, "[REDACTED_GOOGLE_KEY]"],
  [/hv[sb]\.[A-Za-z0-9_-]{20,}/g, "[REDACTED_VAULT_TOKEN]"],
  [/dop_v1_[A-Za-z0-9]{40,}/g, "[REDACTED]"],
  [/dckr_pat_[A-Za-z0-9_-]{20,}/g, "[REDACTED]"],
  [/pypi-[A-Za-z0-9_-]{16,}/g, "[REDACTED]"],
  [/rk_(?:live|test)_[A-Za-z0-9]{16,}/g, "[REDACTED]"],
  [/whsec_[A-Za-z0-9]{16,}/g, "[REDACTED]"],
  [/SG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, "[REDACTED]"],
  [/(eyJ[A-Za-z0-9_-]{6,}(?:\.[A-Za-z0-9_-]{4,}){1,2})/g, "[REDACTED_JWT]"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----(?:[\s\S]*?-----END[^\n]*-----|\r?\n[A-Za-z0-9+/=][A-Za-z0-9+/=\r\n]*)?/g, "[REDACTED_PEM]"],
  [/\b((?:--?)?[A-Za-z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|PASS|APIKEY|KEY|CRED|CREDS|CREDENTIAL|CREDENTIALS|AUTH|_PWD)[A-Za-z0-9_]*['"]?\s*=\s*)(?:"[^"]*"|'[^']*'|[^"'\s]\S*)/gi, "$1[REDACTED]"],
  [/\b([A-Za-z0-9_]*(?:TOKEN|SECRET|PASSWORD|PASSWD|PASS|APIKEY|KEY|CRED|CREDS|CREDENTIAL|CREDENTIALS|_PWD)[A-Za-z0-9_]*['"]?\s*:\s*)(?:"[^"]*"|'[^']*'|[^\s'",}]+)/gi, "$1[REDACTED]"],
  [/((?:^|[\s'"{,])['"]?(?:[A-Za-z0-9_]+_)?auth['"]?\s*:\s*)(?:"[^"]*"|'[^']*'|[^\s'",}]+)/gi, "$1[REDACTED]"],
  [/(\bpwd\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^/~\s][^\s;'"]*)/gi, "$1[REDACTED]"],
  [/([=:]\s*["']?)[A-Za-z0-9_\-+/=]{40,}/g, "$1[REDACTED]"]
];

export function redactCommand(cmd: string): string {
  let out = cmd;
  for (const [re, rep] of PATTERNS) {
    out = out.replace(re, rep);
  }
  return out;
}
