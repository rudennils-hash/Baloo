import * as vscode from 'vscode';
import { ToolRegistry } from './tools/toolRegistry';
import { SelfBuilder } from './selfBuilder';
import { MemoryStore } from './memory/memoryStore';
import { Planner } from './planner/planner';
import { OllamaProvider } from './providers/ollamaProvider';

export interface BalooContext {
  prompt: string;
  tools: ToolRegistry;
  memory: MemoryStore;
  builder: SelfBuilder;
  provider: OllamaProvider;
}

export class BalooCore {
  private context: BalooContext;
  private statusBarItem: vscode.StatusBarItem;

  constructor(
    private contextExtension: vscode.ExtensionContext,
    private outputChannel: vscode.OutputChannel
  ) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.text = '$(pulse) Baloo';
    this.statusBarItem.tooltip = 'Baloo är aktiv och kan bygga sig själv';
    this.statusBarItem.command = 'baloo.showPanel';
    this.statusBarItem.show();

    const provider = new OllamaProvider();
    const tools = new ToolRegistry();
    const memory = new MemoryStore(contextExtension);
    const builder = new SelfBuilder(contextExtension, tools, memory);

    this.context = {
      prompt: '',
      tools,
      memory,
      builder,
      provider
    };
  }

  async execute(prompt: string): Promise<string> {
    this.context.prompt = prompt;
    this.outputChannel.appendLine(`[Baloo] Ny fråga: ${prompt}`);

    try {
      const plan = await Planner.createPlan(prompt, this.context);
      this.outputChannel.appendLine(`[Baloo] Plan skapad med ${plan.steps.length} steg`);

      const results: string[] = [];
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        this.outputChannel.appendLine(`[Baloo] Steg ${i + 1}/${plan.steps.length}: ${step.description}`);
        
        const result = await this.executeStep(step);
        results.push(result);
        
        if (step.reflection) {
          const reflection = await this.reflectOnStep(step, result);
          this.outputChannel.appendLine(`[Baloo] Reflektion: ${reflection}`);
          await this.context.memory.storeExperience({
            step: step.description,
            result,
            reflection,
            timestamp: Date.now()
          });
        }
      }

      const finalAnswer = await this.synthesizeResults(results, prompt);
      await this.context.memory.storeExperience({
        prompt,
        plan: plan.steps.map(s => s.description),
        result: finalAnswer,
        timestamp: Date.now()
      });

      return finalAnswer;
    } catch (error: any) {
      this.outputChannel.appendLine(`[Baloo] Fel: ${error.message}`);
      
      // Försök att lösaproblemet själv
      if (error.message.includes('tool not found') || error.message.includes(' capability')) {
        return await this.selfImprove(error.message, prompt);
      }
      
      return `Tyvärr, jag stötte på ett problem: ${error.message}`;
    }
  }

  private async executeStep(step: any): Promise<string> {
    if (step.type === 'tool') {
      return await this.context.tools.execute(step.tool, step.args);
    } else if (step.type === 'code') {
      return await this.executeCode(step.code);
    } else if (step.type === 'build') {
      return await this.context.builder.buildTool(step.specification);
    } else if (step.type === 'self-improve') {
      return await this.selfImprove(step.issue, step.goal);
    } else if (step.type === 'ask-user') {
      const answer = await vscode.window.showInputBox({
        prompt: step.question,
        placeHolder: step.placeholder || 'Ditt svar...'
      });
      return answer || 'Inget svar givet';
    }
    throw new Error(`Okänd stegstyp: ${step.type}`);
  }

  private async executeCode(code: string): Promise<string> {
    const tempFile = Uri.joinPath(this.contextExtension.extensionUri, 'temp', `script_${Date.now()}.ts`);
    const fs = require('fs');
    const path = require('path');
    
    try {
      fs.mkdirSync(path.dirname(tempFile.fsPath), { recursive: true });
      fs.writeFileSync(tempFile.fsPath, code);
      
      // Skapa ett package.json för temp-skriptet
      const packageJson = {
        name: 'baloo-temp-script',
        version: '1.0.0',
        main: path.basename(tempFile.fsPath)
      };
      fs.writeFileSync(path.join(path.dirname(tempFile.fsPath), 'package.json'), JSON.stringify(packageJson, null, 2));
      
      // Installera beroenden om koden behöver det
      if (code.includes('import') || code.includes('require')) {
        await this.installDependencies(tempFile.fsPath);
      }
      
      // Kör skriptet
      const { execSync } = require('child_process');
      const result = execSync(`npx ts-node ${tempFile.fsPath}`, { 
        encoding: 'utf8',
        cwd: path.dirname(tempFile.fsPath),
        timeout: 30000
      });
      
      return result.toString();
    } catch (error: any) {
      return `Fel vid exekvering: ${error.message}`;
    }
  }

  private async installDependencies(filePath: string): Promise<void> {
    // Analysera kod för att hitta externa paket
    const fs = require('fs');
    const code = fs.readFileSync(filePath, 'utf8');
    const imports = this.extractImports(code);
    
    if (imports.length > 0) {
      const { execSync } = require('child_process');
      const packageJsonPath = require('path').join(require('path').dirname(filePath), 'package.json');
      
      // Uppdatera package.json med nya dependencies
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      pkg.dependencies = { ...pkg.dependencies, ...imports };
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
      
      // Installera paket
      execSync('npm install', { cwd: require('path').dirname(filePath), stdio: 'pipe' });
    }
  }

  private extractImports(code: string): Record<string, string> {
    const imports: Record<string, string> = {};
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      const pkg = match[1];
      if (!pkg.startsWith('.') && !pkg.startsWith('/')) {
        imports[pkg] = 'latest';
      }
    }
    
    return imports;
  }

  private async reflectOnStep(step: any, result: string): Promise<string> {
    const reflectionPrompt = `Jag utförde steget: "${step.description}".\nResultatet var: ${result}\n\nAnalysera: Vad gick bra? Vad kunde göras bättre? Hur kan jag förbättra detta verktyg eller min metod?`;
    
    return await this.context.provider.ask(reflectionPrompt);
  }

  private async synthesizeResults(results: string[], originalPrompt: string): Promise<string> {
    const synthesisPrompt = `Jag har fått följande resultat från min plan:\n\n${results.join('\n\n')}\n\nUrsprunglig fråga: ${originalPrompt}\n\nSammanfatta och ge ett tydligt svar.`;
    
    return await this.context.provider.ask(synthesisPrompt);
  }

  private async selfImprove(issue: string, goal: string): Promise<string> {
    this.outputChannel.appendLine(`[Baloo] Försöker förbättra mig själv...`);
    
    // Läs min egen kod
    const selfCode = await this.readOwnCode();
    
    const improvementPrompt = `Jag har följande problem: "${issue}".\n\nMin nuvarande kod:\n${selfCode}\n\nHur kan jag förbättra mig för att nå målet: "${goal}"? Ge specifika kodändringar.`;
    
    const suggestion = await this.context.provider.ask(improvementPrompt);
    
    // Applicera ändringarna
    const applied = await this.context.builder.applyImprovements(suggestion);
    
    if (applied) {
      return `Jag har förbättrat mig själv baserat på erfarenheten. ${suggestion}`;
    } else {
      return `Jag identifierade förbättringar men kunde inte applicera dem säkert: ${suggestion}`;
    }
  }

  private async readOwnCode(): Promise<string> {
    const fs = require('fs');
    const path = require('path');
    const ownFiles: string[] = [];
    
    const srcDir = path.join(this.contextExtension.extensionUri.fsPath, 'src');
    this.readDirectory(srcDir, ownFiles);
    
    let code = '';
    for (const file of ownFiles) {
      if (file.endsWith('.ts')) {
        code += `\n\n=== ${file} ===\n`;
        code += fs.readFileSync(file, 'utf8');
      }
    }
    
    return code;
  }

  private readDirectory(dir: string, files: string[]): void {
    const fs = require('fs');
    const path = require('path');
    
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        this.readDirectory(fullPath, files);
      } else if (item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}