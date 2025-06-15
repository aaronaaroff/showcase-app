import type { Route } from "./+types/api.ai.generate";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt, options = {} } = await request.json();
    
    if (!prompt) {
      return new Response('Prompt is required', { status: 400 });
    }

    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = options.model || process.env.OLLAMA_MODEL || 'llama3.2';

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048,
          top_p: options.topP || 0.9,
          top_k: options.topK || 40
        }
      }),
    });

    if (!response.ok) {
      console.error('Ollama API error:', response.status, response.statusText);
      return new Response('AI service unavailable', { status: 503 });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({ 
      response: data.response || 'No response generated' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('AI generate error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}