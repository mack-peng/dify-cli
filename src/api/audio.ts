import * as fs from 'fs';
import * as path from 'path';
import { DifyClient } from './client';

export interface AudioToTextResponse {
  text: string;
}

export class AudioAPI {
  constructor(private client: DifyClient) {}

  async toText(filePath: string, user: string): Promise<AudioToTextResponse> {
    const buffer = await fs.promises.readFile(filePath);
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    const formData = new FormData();
    formData.append('file', blob, path.basename(filePath));
    formData.append('user', user);
    return this.client.uploadFile('/audio-to-text', formData);
  }

  async toAudio(text: string, user: string): Promise<Response> {
    return this.client.requestStream('/text-to-audio', {
      method: 'POST',
      body: { text, user },
    });
  }
}
