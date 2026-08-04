import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.dify');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface ProfileConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultUser?: string;
}

interface RcFile {
  active: string;
  profiles: Record<string, ProfileConfig>;
}

function isLegacyFormat(obj: any): boolean {
  return obj && (obj.apiKey !== undefined || obj.baseUrl !== undefined || obj.defaultUser !== undefined)
    && obj.active === undefined && obj.profiles === undefined;
}

export function maskApiKey(key: string): string {
  const prefix = ['app-', 'dataset-'].find(p => key.startsWith(p)) || '';
  const body = prefix ? key.slice(prefix.length) : key;
  if (body.length <= 4) return prefix + '****';
  return prefix + body.slice(0, 4) + '****' + body.slice(-4);
}

export class ConfigManager {
  private rc: RcFile;

  constructor() {
    this.rc = this.load();
  }

  private load(): RcFile {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        if (isLegacyFormat(raw)) {
          const migrated: RcFile = { active: 'default', profiles: { default: raw } };
          this.writeRc(migrated);
          return migrated;
        }
        if (raw.active && raw.profiles) {
          return raw as RcFile;
        }
      }
    } catch {}
    return { active: 'default', profiles: {} };
  }

  private writeRc(rc: RcFile): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(rc, null, 2));
  }

  getConfigFilePath(): string {
    return CONFIG_FILE;
  }

  getActiveProfileName(): string {
    return this.rc.active;
  }

  getProfile(name: string): ProfileConfig | undefined {
    return this.rc.profiles[name];
  }

  listProfiles(): { active: string; profiles: Array<{ name: string; active: boolean; apiKey: string; baseUrl: string; defaultUser: string }> } {
    return {
      active: this.rc.active,
      profiles: Object.entries(this.rc.profiles).map(([name, p]) => ({
        name,
        active: name === this.rc.active,
        apiKey: p.apiKey ? maskApiKey(p.apiKey) : '(not set)',
        baseUrl: p.baseUrl || '(not set)',
        defaultUser: p.defaultUser || '(not set)',
      })),
    };
  }

  setActiveProfile(name: string): void {
    if (!this.rc.profiles[name]) {
      throw new Error(`Profile '${name}' not found`);
    }
    this.rc.active = name;
    this.writeRc(this.rc);
  }

  createProfile(name: string): void {
    if (this.rc.profiles[name]) {
      throw new Error(`Profile '${name}' already exists`);
    }
    this.rc.profiles[name] = {};
    this.writeRc(this.rc);
  }

  save(config: Partial<ProfileConfig>): void {
    const active = this.rc.active;
    if (!this.rc.profiles[active]) {
      this.rc.profiles[active] = {};
    }
    Object.assign(this.rc.profiles[active], config);
    this.writeRc(this.rc);
  }

  saveProfileConfig(name: string, config: Partial<ProfileConfig>): void {
    if (!this.rc.profiles[name]) {
      this.rc.profiles[name] = {};
    }
    Object.assign(this.rc.profiles[name], config);
    this.writeRc(this.rc);
  }

  get(key: keyof ProfileConfig): string | undefined {
    return this.rc.profiles[this.rc.active]?.[key];
  }

  getAll(): ProfileConfig {
    return { ...this.rc.profiles[this.rc.active] || {} };
  }
}
