import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { formatOutput } from '../utils/output';
import { buildSkillMd, buildPitfallsMd } from '../installer/skill-template';

const AGENT_SKILL_DIRS: Record<string, string> = {
  claude: '.claude/skills',
  opencode: '.agents/skills',
  codex: '.codex/skills',
  cursor: '.agents/skills',
  hermes: '.hermes/skills',
  gemini: '.gemini/skills',
};

const SKILL_NAME = 'dify-cli';

function skillDirsForTarget(target: string): string[] {
  if (target === 'all') {
    const seen = new Set<string>();
    return Object.values(AGENT_SKILL_DIRS).filter(d => {
      if (seen.has(d)) return false;
      seen.add(d);
      return true;
    });
  }
  if (target === 'auto') {
    return ['.agents/skills', '.claude/skills'];
  }
  const dir = AGENT_SKILL_DIRS[target];
  if (dir) return [dir];
  throw new Error(`Unknown agent target: ${target}. Known: ${Object.keys(AGENT_SKILL_DIRS).join(', ')}, auto, all`);
}

function writeSkill(dir: string, verbose: boolean = false): 'created' | 'updated' | 'unchanged' {
  const skillRoot = path.join(dir, SKILL_NAME);
  if (!fs.existsSync(skillRoot)) fs.mkdirSync(skillRoot, { recursive: true });

  const skillMdPath = path.join(skillRoot, 'SKILL.md');
  const refsDir = path.join(skillRoot, 'references');
  if (!fs.existsSync(refsDir)) fs.mkdirSync(refsDir, { recursive: true });
  const pitfallsPath = path.join(refsDir, 'pitfalls.md');

  const skillContent = buildSkillMd();
  const pitfallsContent = buildPitfallsMd();

  let existingSkill: string | null = null;
  let existingPitfalls: string | null = null;
  try { existingSkill = fs.readFileSync(skillMdPath, 'utf-8'); } catch { /* file missing */ }
  try { existingPitfalls = fs.readFileSync(pitfallsPath, 'utf-8'); } catch { /* file missing */ }

  if (existingSkill === skillContent && existingPitfalls === pitfallsContent) {
    if (verbose) console.log(`  unchanged: ${skillRoot}`);
    return 'unchanged';
  }

  fs.writeFileSync(skillMdPath, skillContent);
  fs.writeFileSync(pitfallsPath, pitfallsContent);

  const action = existingSkill ? 'updated' : 'created';
  if (verbose) console.log(`  ${action}: ${skillRoot}`);
  return action;
}

function removeSkill(dir: string, verbose: boolean = false): 'removed' | 'not-found' {
  const skillRoot = path.join(dir, SKILL_NAME);
  const skillMdPath = path.join(skillRoot, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    if (verbose) console.log(`  not found: ${skillRoot}`);
    return 'not-found';
  }

  function rmRf(d: string) {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) rmRf(full);
      else try { fs.unlinkSync(full); } catch { /* ignore */ }
    }
    try { fs.rmdirSync(d); } catch { /* ignore */ }
  }

  rmRf(skillRoot);
  if (verbose) console.log(`  removed: ${skillRoot}`);
  return 'removed';
}

export function registerSkillCommands(program: Command): void {
  program
    .command('skill-install')
    .description('Install Agent Skill for dify-cli')
    .option('--target <agent>', 'Agent target: auto, all, opencode, claude, codex, cursor, hermes, gemini (default: auto)', 'auto')
    .option('--path <dir>', 'Custom install directory (overrides agent auto-detection)')
    .action((options) => {
      try {
        const baseDir = options.path || os.homedir();
        const dirs = skillDirsForTarget(options.target);
        const fullDirs = dirs.map(d => path.resolve(baseDir, d));

        for (const d of fullDirs) writeSkill(d, true);
        console.log(formatOutput({ installed: fullDirs }));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  program
    .command('skill-uninstall')
    .description('Remove Agent Skill for dify-cli')
    .option('--target <agent>', 'Agent target: auto, all, opencode, claude, codex, cursor, hermes, gemini (default: auto)', 'auto')
    .option('--path <dir>', 'Custom install directory')
    .action((options) => {
      try {
        const baseDir = options.path || os.homedir();
        const dirs = skillDirsForTarget(options.target);
        const fullDirs = dirs.map(d => path.resolve(baseDir, d));

        for (const d of fullDirs) removeSkill(d, true);
        console.log(formatOutput({ removed: fullDirs }));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
