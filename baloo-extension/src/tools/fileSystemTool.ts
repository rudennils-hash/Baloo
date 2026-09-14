import * as fs from 'fs';
import * as path from 'path';
import { BaseTool } from './baseTool';

export class FileSystemTool extends BaseTool {
  name = 'filesystem';
  description = 'Läs, skriv och lista filer i projektet';

  async execute(args: any): Promise<string> {
    const { action, filePath, content, recursive } = args;
    
    switch (action) {
      case 'read':
        return this.readFile(filePath);
      case 'write':
        return this.writeFile(filePath, content);
      case 'list':
        return this.listDirectory(filePath, recursive);
      case 'exists':
        return this.fileExists(filePath);
      default:
        throw new Error(`Okänd filåtgärd: ${action}`);
    }
  }

  private readFile(filePath: string): string {
    try {
      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Fil finns inte: ${filePath}`);
      }
      const content = fs.readFileSync(fullPath, 'utf8');
      return content;
    } catch (error: any) {
      return `Fel vid läsning av fil: ${error.message}`;
    }
  }

  private writeFile(filePath: string, content: string): string {
    try {
      const fullPath = path.resolve(filePath);
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf8');
      return `Fil skapad: ${filePath}`;
    } catch (error: any) {
      return `Fel vid skrivning av fil: ${error.message}`;
    }
  }

  private listDirectory(dirPath: string, recursive: boolean = false): string {
    try {
      const fullPath = path.resolve(dirPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Mapp finns inte: ${dirPath}`);
      }
      
      const items: string[] = [];
      this.scanDirectory(fullPath, items, recursive, 0);
      return items.join('\n');
    } catch (error: any) {
      return `Fel vid listning av mapp: ${error.message}`;
    }
  }

  private scanDirectory(dir: string, items: string[], recursive: boolean, depth: number) {
    if (depth > 3) return; // Begränsa djup för prestanda
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const indent = '  '.repeat(depth);
      
      if (entry.isDirectory()) {
        items.push(`${indent}[${entry.name}]`);
        if (recursive) {
          this.scanDirectory(fullPath, items, recursive, depth + 1);
        }
      } else {
        items.push(`${indent}${entry.name}`);
      }
    }
  }

  private fileExists(filePath: string): string {
    const fullPath = path.resolve(filePath);
    return fs.existsSync(fullPath) ? 'Finns' : 'Finns inte';
  }
}