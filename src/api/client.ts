import { ConfigManager } from '../utils/config';

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

export class DifyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(opts?: { apiKey?: string; baseUrl?: string }) {
    const config = new ConfigManager();
    this.apiKey = opts?.apiKey || process.env.DIFY_API_KEY || config.get('apiKey') || '';
    this.baseUrl = opts?.baseUrl || process.env.DIFY_BASE_URL || config.get('baseUrl') || 'https://api.dify.ai/v1';
  }

  private getHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...this.getHeaders(isFormData ? undefined : 'application/json'),
      ...options.headers,
    };
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal || (options.timeout ? AbortSignal.timeout(options.timeout) : undefined),
    });

    if (!response.ok) {
      const error = await response.text();
      let detail = '';
      try {
        const parsed = JSON.parse(error);
        detail = parsed.message || parsed.error || JSON.stringify(parsed);
      } catch {
        detail = error;
      }
      throw new Error(`API ${response.status}: ${detail}`);
    }

    return response.json() as Promise<T>;
  }

  async requestStream(path: string, options: RequestOptions = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...this.getHeaders(isFormData ? undefined : 'application/json'),
      ...options.headers,
    };
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      method: options.method || 'POST',
      headers,
      body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      let detail = '';
      try {
        const parsed = JSON.parse(error);
        detail = parsed.message || parsed.error || JSON.stringify(parsed);
      } catch {
        detail = error;
      }
      throw new Error(`API ${response.status}: ${detail}`);
    }

    return response;
  }

  async uploadFile<T = any>(path: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      let detail = '';
      try {
        const parsed = JSON.parse(error);
        detail = parsed.message || parsed.error || JSON.stringify(parsed);
      } catch {
        detail = error;
      }
      throw new Error(`API ${response.status}: ${detail}`);
    }

    return response.json() as Promise<T>;
  }
}
