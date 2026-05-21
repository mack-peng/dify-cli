import { DifyClient } from './client';
import { FileInput } from './chat';

export interface CompletionRequest {
  inputs?: Record<string, any>;
  query: string;
  response_mode: 'blocking' | 'streaming';
  user: string;
  files?: FileInput[];
  auto_generate_name?: boolean;
}

export interface CompletionResponse {
  message_id: string;
  mode: string;
  answer: string;
  metadata?: Record<string, any>;
  created_at: number;
}

export class CompletionAPI {
  constructor(private client: DifyClient) {}

  async sendMessage(params: CompletionRequest): Promise<CompletionResponse> {
    return this.client.request<CompletionResponse>('/completion-messages', { method: 'POST', body: params });
  }

  sendMessageStream(params: CompletionRequest): Promise<Response> {
    return this.client.requestStream('/completion-messages', { method: 'POST', body: params });
  }

  async stopMessage(taskId: string, user: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/completion-messages/${taskId}/stop`, { method: 'POST', body: { user } });
  }
}
