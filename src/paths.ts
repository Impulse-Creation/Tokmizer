import os from "node:os";
import { join } from "node:path";

export function tokmizerHome(): string {
  return process.env.TOKMIZER_HOME ?? join(os.homedir(), ".tokmizer");
}

export function skillsDir(): string {
  return join(tokmizerHome(), "skills");
}

export function skillFile(slug: string): string {
  return join(skillsDir(), `${slug}.md`);
}

export function claudeCommandsDir(): string {
  return process.env.TOKMIZER_CLAUDE_COMMANDS_DIR ?? join(os.homedir(), ".claude", "commands");
}

export function claudeCommandFile(name: string): string {
  return join(claudeCommandsDir(), `${name}.md`);
}
