import { DifyClient } from './client';

export interface CreateDatasetParams {
  name: string;
  description?: string;
  indexing_technique?: 'high_quality' | 'economy';
  permission?: 'only_me' | 'all_team_members';
  provider?: string;
  retrieval_model?: Record<string, any>;
  embedding_model?: string;
  embedding_model_provider?: string;
  doc_form?: string;
  doc_language?: string;
}

export interface DatasetResponse {
  id: string;
  name: string;
  description?: string;
  provider: string;
  permission: string;
  indexing_technique?: string;
  created_at: number;
  updated_at: number;
  document_count: number;
  word_count: number;
  status: string;
  error?: string;
  retrieval_model?: Record<string, any>;
  tags?: { id: string; name: string; type: string }[];
}

export interface ListDatasetsResponse {
  data: DatasetResponse[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface CreateDocumentByTextParams {
  name: string;
  text: string;
  doc_type?: string;
  doc_metadata?: Record<string, any>;
  indexing_technique?: string;
  process_rule?: {
    mode: 'automatic' | 'custom' | 'hierarchical';
    rules?: Record<string, any>;
  };
  retrieval_model?: Record<string, any>;
  embedding_model?: string;
  embedding_model_provider?: string;
}

export interface DocumentResponse {
  id: string;
  name: string;
  status: string;
  created_at: number;
  tokens?: number;
  error?: string;
  indexing_status?: string;
  enabled?: boolean;
  data_source_type?: string;
  word_count?: number;
  doc_metadata?: Record<string, any>;
  doc_type?: string;
  batch?: string;
  position?: number;
  dataset_process_rule_id?: string;
  dataset_id?: string;
  completed_segments?: number;
  total_segments?: number;
}

export interface IndexingStatusResponse {
  data: {
    id: string;
    indexing_status: string;
    processing_started_at: number;
    parsing_completed_at: number;
    cleaning_completed_at: number;
    splitting_completed_at: number;
    completed_at: number;
    paused_at?: number;
    error?: string;
    stopped_at?: number;
    completed_segments: number;
    total_segments: number;
  }[];
}

export interface SegmentResponse {
  id: string;
  content: string;
  word_count: number;
  tokens: number;
  status: string;
  keywords?: string[];
  enabled: boolean;
  created_at: number;
  updated_at: number;
  error?: string;
  document_id: string;
  dataset_id: string;
  position: number;
  hash?: string;
  child_chunks?: any[];
}

export interface ListSegmentsResponse {
  data: SegmentResponse[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export class KnowledgeAPI {
  constructor(private client: DifyClient) {}

  async listDatasets(params?: { page?: number; limit?: number; keyword?: string }): Promise<ListDatasetsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.keyword) query.set('keyword', params.keyword);
    const qs = query.toString();
    return this.client.request<ListDatasetsResponse>(`/datasets${qs ? '?' + qs : ''}`);
  }

  async createDataset(params: CreateDatasetParams): Promise<DatasetResponse> {
    return this.client.request<DatasetResponse>('/datasets', { method: 'POST', body: params });
  }

  async getDataset(datasetId: string): Promise<DatasetResponse> {
    return this.client.request<DatasetResponse>(`/datasets/${datasetId}`);
  }

  async updateDataset(datasetId: string, params: Partial<CreateDatasetParams>): Promise<DatasetResponse> {
    return this.client.request<DatasetResponse>(`/datasets/${datasetId}`, { method: 'PATCH', body: params });
  }

  async deleteDataset(datasetId: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/datasets/${datasetId}`, { method: 'DELETE' });
  }

  async listDocuments(datasetId: string, params?: { page?: number; limit?: number; keyword?: string }): Promise<{ data: DocumentResponse[]; page: number; limit: number; total: number; has_more: boolean }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.keyword) query.set('keyword', params.keyword);
    const qs = query.toString();
    return this.client.request(`/datasets/${datasetId}/documents${qs ? '?' + qs : ''}`);
  }

  async createDocumentByText(datasetId: string, params: CreateDocumentByTextParams): Promise<DocumentResponse> {
    return this.client.request<DocumentResponse>(`/datasets/${datasetId}/document/create-by-text`, { method: 'POST', body: params });
  }

  async createDocumentByFile(datasetId: string, formData: FormData): Promise<DocumentResponse> {
    return this.client.request<DocumentResponse>(`/datasets/${datasetId}/document/create-by-file`, { method: 'POST', body: formData });
  }

  async getDocument(datasetId: string, documentId: string): Promise<DocumentResponse> {
    return this.client.request<DocumentResponse>(`/datasets/${datasetId}/documents/${documentId}`);
  }

  async deleteDocument(datasetId: string, documentId: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/datasets/${datasetId}/documents/${documentId}`, { method: 'DELETE' });
  }

  async getIndexingStatus(datasetId: string, batch: string): Promise<IndexingStatusResponse> {
    return this.client.request<IndexingStatusResponse>(`/datasets/${datasetId}/documents/${batch}/indexing-status`);
  }

  async listSegments(datasetId: string, documentId: string, params?: { page?: number; limit?: number; keyword?: string; status?: string }): Promise<ListSegmentsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString();
    return this.client.request<ListSegmentsResponse>(`/datasets/${datasetId}/documents/${documentId}/segments${qs ? '?' + qs : ''}`);
  }

  async createSegment(datasetId: string, documentId: string, params: { content: string; keywords?: string[]; user?: string }): Promise<SegmentResponse> {
    return this.client.request<SegmentResponse>(`/datasets/${datasetId}/documents/${documentId}/segments`, { method: 'POST', body: params });
  }

  async updateSegment(datasetId: string, documentId: string, segmentId: string, params: { content: string; keywords?: string[]; user?: string }): Promise<SegmentResponse> {
    return this.client.request<SegmentResponse>(`/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`, { method: 'PATCH', body: params });
  }

  async deleteSegment(datasetId: string, documentId: string, segmentId: string): Promise<{ result: string }> {
    return this.client.request<{ result: string }>(`/datasets/${datasetId}/documents/${documentId}/segments/${segmentId}`, { method: 'DELETE' });
  }
}
