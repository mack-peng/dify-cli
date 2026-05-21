import { DifyClient } from './client';
import { AppFeedbacksParams, AppFeedbacksResponse } from './chat';

export class FeedbackAPI {
  constructor(private client: DifyClient) {}

  async list(params?: AppFeedbacksParams): Promise<AppFeedbacksResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.app_type) query.set('app_type', params.app_type);
    const qs = query.toString();
    return this.client.request<AppFeedbacksResponse>(`/feedbacks${qs ? '?' + qs : ''}`);
  }
}
