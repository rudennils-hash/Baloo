import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { OllamaProvider } from '../providers/ollamaProvider';

export class SelfBuilder {
  private contextExtension: vscode.ExtensionContext;
  private outputChannel: vscode.OutputChannel;

  constructor(contextExtension: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
    this.contextExtension = contextExtension;
    this.outputChannel = outputChannel;
  }

  /** Läs in all källkod i src/ och returnera som en sträng */
  async readOwnCode(): Promise<string> {
    const srcDir = path.join(this.contextExtension.extensionUri.fsPath, 'src');
    const files: string[] = [];

    const readDirRecursive = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          readDirRecursive(fullPath);
        } else if (entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    };

    readDirRecursive(srcDir);

    let code = '';
    for (const file of files) {
      code += `\n\n=== ${path.relative(this.contextExtension.extensionUri.fsPath, file)} ===\n`;
      code += fs.readFileSync(file, 'utf8');
    }
    return code;
  }

  /** Simulerar tillämpning av förbättringsförslag.
   *  I en verklig implementation skulle detta använda vscode.workspace.edit för att göra faktiska ändringar.
   */
  async applyImprovements(suggestion: string): Promise<boolean> {
    // För demo‑ändamål: logga förslaget och anta att det har tillämpats
    this.outputChannel.appendLine('[SelfBuilder] Förslag till applicering:');
    this.outputChannel.appendLine(suggestion);
    // Simulera att ändringarna har gjort
    return true;
  }

  /** Returnerar en sträng som beskriver hur Baloo kan bygga sig själv */
  getSelfBuildingCapabilities(): string {
    return `
Baloo kan:
1. Läsa sin egen källkod (src/‑mappen) för att förstå sin nuvarande struktur.
2. Analysera koden för potentiella förbättringar (t.ex. saknande kommentarer, ineffektiva algoritmer, felhantering).
3. Anropa sin egen Ollama‑provider för att generera konkreta förbättringsförslag.
4. Tillämpa förbättringarna genom att redigera sina egna filer (t.ex. lägga till kommentarer, optimera funktioner, fixa bug).
5. Reflektera över resultatet och lagra erfarenheten i min minnesmodul för framtida iterationer.
`.trim();
  }
}