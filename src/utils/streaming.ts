export interface SSEEvent {
  event?: string;
  data: any;
  id?: string;
}

export async function* parseSSEStream(response: Response): AsyncGenerator<SSEEvent> {
  if (!response.body) {
    throw new Error('Response body is null, cannot stream');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let currentEvent: Partial<SSEEvent> = {};

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent.event = line.slice(7);
        } else if (line.startsWith('data: ')) {
          const raw = line.slice(6);
          if (raw === '[DONE]') {
            if (currentEvent.event || currentEvent.data) {
              yield currentEvent as SSEEvent;
            }
            currentEvent = {};
            continue;
          }
          try {
            currentEvent.data = JSON.parse(raw);
          } catch {
            currentEvent.data = raw;
          }
        } else if (line.startsWith('id: ')) {
          currentEvent.id = line.slice(4);
        } else if (line === '') {
          if (currentEvent.data) {
            yield currentEvent as SSEEvent;
          }
          currentEvent = {};
        }
      }
    }

    if (currentEvent.data) {
      yield currentEvent as SSEEvent;
    }
  } finally {
    reader.releaseLock();
  }
}
