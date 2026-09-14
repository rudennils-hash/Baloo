import * as vscode from 'vscode';

export interface OllamaModelInfo {
  name: string;
  model: string;
  modified: string;
}

export class OllamaProvider {
  private endpoint: string;
  private model: string;

  constructor() {
    // Hämtas från extension-inställningar, default för Ollama
    const cfg = vscode.workspace.getConfiguration('baloo');
    this.endpoint = cfg.get<string>('ollamaEndpoint', 'http://localhost:11434');
    this.model = cfg.get<string>('defaultModel', 'llama2');
  }

  /**
   * Anropa Ollama API med en prompt och returnera svaret som text.
   * @param prompt Texten som ska skickas till modellen.
   * @returns Modellens svar.
   */
  async ask(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          // Temperatur 0.7 ger lite kreativitet utan att bli slumpmässig
          temperature: 0.7,
          // max_tokens begränsar svarets längd
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`HTTP ${response.status}: ${err}`);
      }

      // Ollama returnerar JSON med fältet 'response'
      const data: { response: string } = await response.json();
      return data.response;
    } catch (error: any) {
      // Felhantering vid problem med nätverk eller API
      return `Kunde inte anropa Ollama: ${error.message}`;
    }
  }

  /**
   * Hämtar kort information om tillgängliga modeller i Ollama.
   */
  async listModels(): Promise<OllamaModelInfo[]> {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status}`);
      }
      const data: { models: OllamaModelInfo[] } = await response.json();
      return data.models;
    } catch (error: any) {
      return [];
    }
  }
}