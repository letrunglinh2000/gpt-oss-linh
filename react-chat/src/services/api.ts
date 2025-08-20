import environment from '../config/environment';

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  stream: boolean;
}

export class LMStudioAPI {
  private baseURL: string;

  constructor(baseURL = environment.apiBaseUrl) {
    this.baseURL = baseURL;
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': 'Bearer lm-studio',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw new Error(`Can't reach LM Studio at ${environment.apiBaseUrl}. Is the server running and the port correct?`);
    }
  }

  async *streamChatCompletion(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer lm-studio',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield content;
                }
              } catch {
                // Ignore JSON parse errors for individual chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      // Fallback to non-streaming
      yield* this.fallbackNonStreaming(request);
    }
  }

  private async *fallbackNonStreaming(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer lm-studio',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...request, stream: false }),
      });

      if (!response.ok) {
        throw new Error(`Can't reach LM Studio at ${environment.apiBaseUrl}. Is the server running and the port correct?`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        yield content;
      }
    } catch (error) {
      throw new Error(`Can't reach LM Studio at ${environment.apiBaseUrl}. Is the server running and the port correct?`);
    }
  }
}
