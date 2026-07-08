import { DifyClient } from './client';
import { buildQueryString } from '../utils/query';

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
    return this.client.request<ListAnnotationsResponse>(`/annotations${buildQueryString({
      page: params?.page,
      limit: params?.limit,
    })}`);
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
