// Reusable AI service layer that can switch between different providers
// Currently supports Ollama through an API route

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export const aiService = {
  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.response || 'I apologize, but I was unable to generate a response at this time.';
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('AI service is currently unavailable. Please try again later.');
    }
  },

  // Method to check if AI service is available
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'test',
          options: { maxTokens: 1 }
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};