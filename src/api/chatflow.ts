import { DifyClient } from './client';
import { ChatRequest, ChatResponse, StopResponse, FeedbackRequest, FeedbackResponse } from './chat';

export class ChatflowAPI {
  constructor(private client: DifyClient) {}

  async sendMessage(params: ChatRequest): Promise<ChatResponse> {
    return this.client.request<ChatResponse>('/chat-messages', { method: 'POST', body: { ...params, mode: 'advanced-chat' } });
  }

  sendMessageStream(params: ChatRequest): Promise<Response> {
    return this.client.requestStream('/chat-messages', { method: 'POST', body: { ...params, mode: 'advanced-chat' } });
  }

  async stopMessage(taskId: string, user: string): Promise<StopResponse> {
    return this.client.request<StopResponse>(`/chat-messages/${taskId}/stop`, { method: 'POST', body: { user } });
  }

  async submitFeedback(messageId: string, params: FeedbackRequest): Promise<FeedbackResponse> {
    return this.client.request<FeedbackResponse>(`/messages/${messageId}/feedbacks`, { method: 'POST', body: params });
  }
}
