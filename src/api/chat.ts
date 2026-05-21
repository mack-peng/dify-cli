import { DifyClient } from './client';

export interface FileInput {
  type: 'image' | 'document' | 'audio' | 'video';
  transfer_method: 'remote_url' | 'local_file';
  url?: string;
  upload_file_id?: string;
}

export interface ChatRequest {
  inputs?: Record<string, any>;
  query: string;
  response_mode: 'blocking' | 'streaming';
  user: string;
  conversation_id?: string;
  files?: FileInput[];
  auto_generate_name?: boolean;
}

export interface ChatResponse {
  message_id: string;
  conversation_id: string;
  mode: string;
  answer: string;
  metadata?: Record<string, any>;
  created_at: number;
}

export interface StopResponse {
  result: string;
}

export interface SuggestedQuestionsResponse {
  data: string[];
}

export interface FeedbackRequest {
  rating: 'like' | 'dislike';
  user: string;
  content?: string;
}

export interface FeedbackResponse {
  result: string;
}

export interface AppFeedbacksParams {
  page?: number;
  limit?: number;
  app_type?: 'chat' | 'advanced-chat' | 'workflow' | 'completion';
}

export interface AppFeedbacksResponse {
  data: any[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export class ChatAPI {
  constructor(private client: DifyClient) {}

  async sendMessage(params: ChatRequest): Promise<ChatResponse> {
    return this.client.request<ChatResponse>('/chat-messages', { method: 'POST', body: params });
  }

  sendMessageStream(params: ChatRequest): Promise<Response> {
    return this.client.requestStream('/chat-messages', { method: 'POST', body: params });
  }

  async stopMessage(taskId: string, user: string): Promise<StopResponse> {
    return this.client.request<StopResponse>(`/chat-messages/${taskId}/stop`, { method: 'POST', body: { user } });
  }

  async getSuggestedQuestions(messageId: string, user: string): Promise<string[]> {
    return this.client.request<string[]>(`/messages/${messageId}/suggested?user=${encodeURIComponent(user)}`);
  }

  async submitFeedback(messageId: string, params: FeedbackRequest): Promise<FeedbackResponse> {
    return this.client.request<FeedbackResponse>(`/messages/${messageId}/feedbacks`, { method: 'POST', body: params });
  }
}
