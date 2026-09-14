import { Provider } from './providers';

export interface AttackRecord {
  id: string;
  timestamp: number;
  prompt: string;
  reason: string;
}

export class Defender {
  private attackCount = 0;
  private history: AttackRecord[] = [];

  sanitizePrompt(prompt: string): string {
    const normalized = prompt.toLowerCase();
    const forbidden = ['ignore', 'system', 'password', 'secret'];
    const hit = forbidden.find(keyword => normalized.includes(keyword));

    if (hit) {
      this.recordAttack(prompt, `forbidden keyword: ${hit}`);
      throw new Error('Prompt blocked by defender');
    }

    return prompt;
  }

  getProtectionLevel(): 'low' | 'medium' | 'high' {
    if (this.attackCount >= 5) return 'high';
    if (this.attackCount >= 2) return 'medium';
    return 'low';
  }

  getAttackHistory(): AttackRecord[] {
    return this.history;
  }

  private recordAttack(prompt: string, reason: string) {
    this.attackCount += 1;
    this.history.push({
      id: `attack_${Date.now()}`,
      timestamp: Date.now(),
      prompt,
      reason,
    });
  }
}