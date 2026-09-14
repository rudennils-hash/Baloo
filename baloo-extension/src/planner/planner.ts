import { BalooContext } from '../balooCore';
import { Tool } from '../tools/baseTool';

export interface Plan {
  steps: PlanStep[];
}

export interface PlanStep {
  type: 'tool' | 'code' | 'build' | 'self-improve' | 'ask-user';
  description: string;
  tool?: string;
  args?: any;
  code?: string;
  specification?: string;
  issue?: string;
  goal?: string;
  question?: string;
  placeholder?: string;
  reflection?: boolean; // Om vi ska reflektera efter steget
}

export class Planner {
  /**
   * Skapa en plan baserat på en prompt och Baloo:s kontext.
   * Detta är en enkel implementation som kan ersättas av en mer avancerad LLM-driven planner.
   */
  static async createPlan(prompt: string, context: BalooContext): Promise<Plan> {
    // Först: kolla om prompten är ett instruktion om självförbättring
    if (prompt.toLowerCase().includes('förbättra') || prompt.toLowerCase().includes('bygg')) {
      return this.createSelfImprovementPlan(prompt, context);
    }

    // Först: kolla om vi behöver använda ett verktyg
    const toolsNeeded = this.detectTools(prompt, context);
    
    if (toolsNeeded.length > 0) {
      return this.createToolPlan(prompt, toolsNeeded, context);
    }

    // Annars: svara med modellen direkt
    return {
      steps: [{
        type: 'code',
        description: 'Svara på frågan med modellen',
        code: `// Fråga till modellen\nconst svar = await context.provider.ask("${prompt.replace(/"/g, '\\"')}");\nreturn svar;`
      }]
    };
  }

  private static detectTools(prompt: string, context: BalooContext): Tool[] {
    const tools: Tool[] = [];
    const lowerPrompt = prompt.toLowerCase();

    for (const tool of context.tools.listTools()) {
      const keywords = this.getToolKeywords(tool);
      if (keywords.some(kw => lowerPrompt.includes(kw))) {
        tools.push(tool);
      }
    }

    return tools;
  }

  private static getToolKeywords(tool: Tool): string[] {
    switch (tool.name) {
      case 'filesystem':
        return ['fil', 'mapp', 'lista', 'skapa', 'läs', 'spara', 'fil'];
      case 'code_executor':
        return ['kör', 'exekvera', 'skript', 'kod', 'program', 'beräkna'];
      default:
        return [];
    }
  }

  private static createToolPlan(prompt: string, tools: Tool[], context: BalooContext): Plan> {
    const steps: PlanStep[] = [];
    
    for (const tool of tools) {
      steps.push({
        type: 'tool',
        description: `Använd verktyget ${tool.name}`,
        tool: tool.name,
        args: { query: prompt },
        reflection: true
      });
    }

    steps.push({
      type: 'code',
      description: 'Syntetisera resultat från verktygen',
      code: `// Sammanfatta resultat från verktyg\nconst resultat = ...;\nconst sammanfattning = await context.provider.ask("Sammanfatta: " + resultat);\nreturn sammanfattning;`
    });

    return { steps };
  }

  private static async createSelfImprovementPlan(prompt: string, context: BalooContext): Promise<Plan> {
    const steps: PlanStep[] = [];
    
    // Steg 1: Läs egen kod
    steps.push({
      type: 'code',
      description: 'Läs min egen källkod',
      code: `const kod = await context.builder.readOwnCode(); return kod;`,
      reflection: true
    });

    // Steg 2: Analysera koden med LLM
    steps.push({
      type: 'code',
      description: 'Analysera egen kod för förbättringsmöjligheter',
      code: `const kod = ...;\nconst analys = await context.provider.ask("Analysera denna kod och föreslå förbättringar: " + kod);\nreturn analys;`,
      reflection: true
    });

    // Steg 3: Applicera förbättringar
    steps.push({
      type: 'build',
      description: 'Bygg förbättrade verktyg baserat på analysen',
      specification: prompt,
      reflection: true
    });

    return { steps };
  }
}