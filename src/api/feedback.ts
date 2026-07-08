import { DifyClient } from './client';
import { buildQueryString } from '../utils/query';
import { AppFeedbacksParams, AppFeedbacksResponse } from './chat';

export class FeedbackAPI {
  constructor(private client: DifyClient) {}

  async list(params?: AppFeedbacksParams): Promise<AppFeedbacksResponse> {
    return this.client.request<AppFeedbacksResponse>(`/feedbacks${buildQueryString({
      page: params?.page,
      limit: params?.limit,
      app_type: params?.app_type,
    })}`);
  }
}
