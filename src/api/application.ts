import { DifyClient } from './client';

export interface AppInfoResponse {
  name: string;
  description?: string;
  tags?: string[];
}

export interface AppParametersResponse {
  opening_statement?: string;
  suggested_questions?: string[];
  suggested_questions_after_answer?: { enabled: boolean };
  speech_to_text?: { enabled: boolean };
  text_to_speech?: { enabled: boolean };
  retriever_resource?: { enabled: boolean };
  annotation_reply?: { enabled: boolean };
  user_input_form?: any[];
  file_upload?: any;
  system_parameters?: {
    image_file_size_limit?: string;
    audio_file_size_limit?: string;
    video_file_size_limit?: string;
    file_size_limit?: number;
  };
}

export interface AppMetaResponse {
  meta?: {
    icon?: string;
    icon_background?: string;
  };
}

export interface AppSiteResponse {
  access_token?: string;
  color?: string;
  copyright?: string;
  description?: string;
  icon?: string;
  icon_background?: string;
  privacy_policy?: string;
  custom_disclaimer?: string;
  title?: string;
  use_icon_as_answer_icon?: boolean;
}

export class ApplicationAPI {
  constructor(private client: DifyClient) {}

  async getInfo(): Promise<AppInfoResponse> {
    return this.client.request<AppInfoResponse>('/info');
  }

  async getParameters(): Promise<AppParametersResponse> {
    return this.client.request<AppParametersResponse>('/parameters');
  }

  async getMeta(): Promise<AppMetaResponse> {
    return this.client.request<AppMetaResponse>('/meta');
  }

  async getSite(): Promise<AppSiteResponse> {
    return this.client.request<AppSiteResponse>('/site');
  }
}
