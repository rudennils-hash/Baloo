export interface Provider {
  name: string;
  generate(prompt: string): Promise<string>;
}

export class OllamaProvider implements Provider {
  name = 'ollama';
  async generate(prompt: string): Promise<string> {
    return `[Ollama simulated response for: ${prompt}]`;
  }
}

export class GroqProvider implements Provider {
  name = 'groq';
  async generate(prompt: string): Promise<string> {
    return `[Groq simulated response for: ${prompt}]`;
  }
}

export class OpenRouterProvider implements Provider {
  name = 'openrouter';
  async generate(prompt: string): Promise<string> {
    return `[OpenRouter simulated response for: ${prompt}]`;
  }
}

export class OpenAdapterProvider implements Provider {
  name = 'openadapter';
  async generate(prompt: string): Promise<string> {
    return `[OpenAdapter simulated response for: ${prompt}]`;
  }
}

export class Providers {
  static providers = [
    new OllamaProvider(),
    new GroqProvider(),
    new OpenRouterProvider(),
    new OpenAdapterProvider(),
  ];
}