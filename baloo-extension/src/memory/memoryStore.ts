import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class MemoryStore {
  private storagePath: string;
  private experiences: any[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.storagePath = path.join(context.globalStorageUri.fsPath, 'memory.json');
    this.load();
  }

  private load() {
    try {
      const data = fs.readFileSync(this.storagePath, 'utf8');
      this.experiences = JSON.parse(data);
    } catch (e) {
      this.experiences = [];
    }
  }

  async storeExperience(experience: any): Promise<void> {
    this.experiences.push(experience);
    await fs.promises.writeFile(this.storagePath, JSON.stringify(this.experiences, null, 2));
  }

  getExperience(): any[] {
    return this.experiences;
  }
}