import { DifyClient } from './client';
import { buildQueryString } from '../utils/query';
import { FileInput } from './chat';

export interface WorkflowRunRequest {
  inputs?: Record<string, any>;
  response_mode: 'blocking' | 'streaming';
  user: string;
  files?: FileInput[];
}

export interface WorkflowRunResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs?: Record<string, any>;
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

export interface WorkflowLogsParams {
  keyword?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface WorkflowLogsResponse {
  data: any[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface WorkflowRunDetailResponse {
  id: string;
  workflow_id: string;
  status: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  error?: string;
  elapsed_time: number;
  total_tokens: number;
  total_steps: number;
  created_at: number;
  finished_at: number;
  created_by: { id: string; name: string };
  workflow: { id: string; name: string; version: string; created_at: number };
  executed_by?: { id: string; name: string };
  steps?: any[];
}

export class WorkflowAPI {
  constructor(private client: DifyClient) {}

  async run(params: WorkflowRunRequest): Promise<WorkflowRunResponse> {
    return this.client.request<WorkflowRunResponse>('/workflows/run', { method: 'POST', body: params });
  }

  runStream(params: WorkflowRunRequest): Promise<Response> {
    return this.client.requestStream('/workflows/run', { method: 'POST', body: params });
  }

  async stop(taskId: string, user: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/workflows/${taskId}/stop`, { method: 'POST', body: { user } });
  }

  async getLogs(params?: WorkflowLogsParams): Promise<WorkflowLogsResponse> {
    return this.client.request<WorkflowLogsResponse>(`/workflows/logs${buildQueryString({
      keyword: params?.keyword,
      status: params?.status,
      page: params?.page,
      limit: params?.limit,
    })}`);
  }

  async getRunDetail(runId: string): Promise<WorkflowRunDetailResponse> {
    return this.client.request<WorkflowRunDetailResponse>(`/workflows/run/${runId}`);
  }
}
