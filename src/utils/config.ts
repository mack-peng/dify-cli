import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.dify');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface DifyConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultUser?: string;
}

export function maskApiKey(key: string): string {
  const prefix = ['app-', 'dataset-'].find(p => key.startsWith(p)) || '';
  const body = prefix ? key.slice(prefix.length) : key;
  if (body.length <= 4) return prefix + '****';
  return prefix + body.slice(0, 4) + '****' + body.slice(-4);
}

export class ConfigManager {
  private config: DifyConfig;

  constructor() {
    this.config = this.load();
  }

  private load(): DifyConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      }
    } catch {}
    return {};
  }

  save(config: DifyConfig): void {
    this.config = { ...this.config, ...config };
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  get(key: keyof DifyConfig): string | undefined {
    return this.config[key];
  }

  getAll(): DifyConfig {
    return { ...this.config };
  }
}
