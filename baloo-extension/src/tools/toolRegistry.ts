import { Tool } from './baseTool';
import { FileSystemTool } from './fileSystemTool';
import { CodeExecutorTool } from './codeExecutorTool';
import { WebSearchTool } from './webSearchTool';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.register(new FileSystemTool());
    this.register(new CodeExecutorTool());
    this.register(new WebSearchTool());
  }

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  async execute(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Verktyg hittades inte: ${name}. Tillgängliga: ${Array.from(this.tools.keys()).join(', ')}`);
    }
    return await tool.execute(args);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }
}