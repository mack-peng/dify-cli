import { ConfigManager } from '../utils/config';

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

export class DifyClient {
  private _apiKey: string;
  private _baseUrl: string;

  constructor(opts?: { apiKey?: string; baseUrl?: string }) {
    const config = new ConfigManager();
    this._apiKey = opts?.apiKey || process.env.DIFY_API_KEY || config.get('apiKey') || '';
    this._baseUrl = opts?.baseUrl || process.env.DIFY_BASE_URL || config.get('baseUrl') || 'https://api.dify.ai/v1';
  }

  get apiKey(): string {
    return this._apiKey;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  private getHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this._apiKey}`,
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  }

  private async handleError(response: Response): Promise<never> {
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

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this._baseUrl}${path}`;
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
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  async requestStream(path: string, options: RequestOptions = {}): Promise<Response> {
    const url = `${this._baseUrl}${path}`;
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
      await this.handleError(response);
    }

    return response;
  }

  async uploadFile<T = any>(path: string, formData: FormData): Promise<T> {
    const url = `${this._baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this._apiKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }
}
