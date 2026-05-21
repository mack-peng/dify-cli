import { DifyClient } from './client';

export interface AnnotationResponse {
  id: string;
  question: string;
  answer: string;
  created_at: number;
  hit_count: number;
  score?: number;
}

export interface ListAnnotationsResponse {
  data: AnnotationResponse[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface ReplyConfigResponse {
  reply_type: string;
  score_threshold: number;
  embedding_model?: Record<string, any>;
}

export class AnnotationAPI {
  constructor(private client: DifyClient) {}

  async create(params: { question: string; answer: string }): Promise<AnnotationResponse> {
    return this.client.request<AnnotationResponse>('/annotations', { method: 'POST', body: params });
  }

  async list(params?: { page?: number; limit?: number }): Promise<ListAnnotationsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.client.request<ListAnnotationsResponse>(`/annotations${qs ? '?' + qs : ''}`);
  }

  async update(annotationId: string, params: { question?: string; answer?: string }): Promise<AnnotationResponse> {
    return this.client.request<AnnotationResponse>(`/annotations/${annotationId}`, { method: 'POST', body: params });
  }

  async delete(annotationId: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/annotations/${annotationId}`, { method: 'DELETE' });
  }

  async getReplyConfig(): Promise<ReplyConfigResponse> {
    return this.client.request<ReplyConfigResponse>('/annotations/reply-config');
  }

  async updateReplyConfig(params: ReplyConfigResponse): Promise<ReplyConfigResponse> {
    return this.client.request<ReplyConfigResponse>('/annotations/reply-config', { method: 'POST', body: params });
  }
}
