/**
 * Streaming Module
 * Client-side utilities for consuming streaming responses
 */

export class StreamingModule {
  /**
   * Consume a streaming response from the API
   */
  static async consumeStream(
    url: string,
    body: any,
    callbacks: {
      onChunk?: (text: string) => void;
      onComplete?: (fullText: string) => void;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              if (callbacks.onComplete) {
                callbacks.onComplete(fullText);
              }
              return fullText;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                if (callbacks.onChunk) {
                  callbacks.onChunk(parsed.text);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullText;
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Create a streaming fetch request with React hooks compatibility
   */
  static createStreamingHook() {
    return (url: string, body: any) => {
      let abortController: AbortController | null = null;

      const startStream = async (
        callbacks: {
          onChunk?: (text: string) => void;
          onComplete?: (fullText: string) => void;
          onError?: (error: Error) => void;
        }
      ) => {
        abortController = new AbortController();
        
        try {
          await this.consumeStream(url, body, callbacks);
        } catch (error) {
          if ((error as any).name !== 'AbortError') {
            throw error;
          }
        }
      };

      const stopStream = () => {
        if (abortController) {
          abortController.abort();
          abortController = null;
        }
      };

      return { startStream, stopStream };
    };
  }
}