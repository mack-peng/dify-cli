import { DifyClient } from './client';

export interface ConversationResponse {
  id: string;
  name: string;
  inputs: Record<string, any>;
  status: string;
  created_at: number;
  updated_at: number;
  message_count?: number;
  summary?: string;
}

export interface ListConversationsResponse {
  data: ConversationResponse[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  inputs: Record<string, any>;
  query: string;
  answer: string;
  feedback?: { rating: string; content?: string };
  retriever_resources?: any[];
  created_at: number;
  agent_thoughts?: any[];
  workflow_run_id?: string;
  metadata?: Record<string, any>;
}

export interface ListMessagesResponse {
  data: MessageResponse[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface ConversationVariablesResponse {
  variables: Record<string, any>;
}

export class ConversationAPI {
  constructor(private client: DifyClient) {}

  async list(params?: { user?: string; page?: number; limit?: number; sort_by?: string }): Promise<ListConversationsResponse> {
    const query = new URLSearchParams();
    if (params?.user) query.set('user', params.user);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    const qs = query.toString();
    return this.client.request<ListConversationsResponse>(`/conversations${qs ? '?' + qs : ''}`);
  }

  async getMessages(conversationId: string, params?: { user?: string; page?: number; limit?: number }): Promise<ListMessagesResponse> {
    const query = new URLSearchParams();
    if (params?.user) query.set('user', params.user);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.client.request<ListMessagesResponse>(`/conversations/${conversationId}/messages${qs ? '?' + qs : ''}`);
  }

  async rename(conversationId: string, name: string, user?: string): Promise<ConversationResponse> {
    return this.client.request<ConversationResponse>(`/conversations/${conversationId}/name`, {
      method: 'POST',
      body: { name, user },
    });
  }

  async delete(conversationId: string, user?: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/conversations/${conversationId}`, {
      method: 'DELETE',
      body: { user },
    });
  }

  async getVariables(conversationId: string, user?: string): Promise<ConversationVariablesResponse> {
    const query = user ? `?user=${encodeURIComponent(user)}` : '';
    return this.client.request<ConversationVariablesResponse>(`/conversations/${conversationId}/variables${query}`);
  }
}
