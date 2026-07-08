import * as fs from 'fs';
import * as path from 'path';
import { DifyClient } from './client';

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_at: number;
  created_by: string;
}

export class FileAPI {
  constructor(private client: DifyClient) {}

  async upload(filePath: string, user: string): Promise<FileUploadResponse> {
    const buffer = await fs.promises.readFile(filePath);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const formData = new FormData();
    formData.append('file', blob, path.basename(filePath));
    formData.append('user', user);
    return this.client.uploadFile('/files/upload', formData);
  }

  async preview(fileId: string): Promise<Response> {
    const url = `${this.client.baseUrl}/files/${fileId}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.client.apiKey}`,
    };
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API ${response.status}: Failed to fetch file`);
    }
    return response;
  }
}
