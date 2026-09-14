export interface Tool {
  name: string;
  description: string;
  execute(args: any): Promise<string>;
}

export abstract class BaseTool implements Tool {
  abstract name: string;
  abstract description: string;
  
  abstract execute(args: any): Promise<string>;
  
  protected validateArgs(args: any, required: string[]): void {
    for (const key of required) {
      if (!(key in args)) {
        throw new Error(`Saknar argument: ${key}`);
      }
    }
  }
}