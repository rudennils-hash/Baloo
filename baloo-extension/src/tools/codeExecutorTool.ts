import { BaseTool } from './baseTool';

export class CodeExecutorTool extends BaseTool {
  name = 'code_executor';
  description = 'Kör TypeScript/JavaScript-kod och returnerar resultat';

  async execute(args: any): Promise<string> {
    const { code, language, dependencies } = args;
    
    this.validateArgs(args, ['code']);
    
    try {
      // Skapa en temporär fil
      const tempDir = require('os').tmpdir();
      const fileName = `baloo_script_${Date.now()}.ts`;
      const filePath = require('path').join(tempDir, fileName);
      
      // Skriv koden till fil
      require('fs').writeFileSync(filePath, code, 'utf8');
      
      // Om dependencies angivna, skapa package.json
      if (dependencies && dependencies.length > 0) {
        const pkgJson = {
          name: 'baloo-temp-script',
          version: '1.0.0',
          dependencies: dependencies.reduce((acc: any, dep: string) => {
            acc[dep] = 'latest';
            return acc;
          }, {})
        };
        require('fs').writeFileSync(
          require('path').join(tempDir, 'baloo-temp-package.json'),
          JSON.stringify(pkgJson, null, 2)
        );
      }
      
      // Kör koden med ts-node eller node
      const { execSync } = require('child_process');
      const command = language === 'typescript' ? 'npx ts-node' : 'node';
      const result = execSync(`${command} ${filePath}`, {
        cwd: tempDir,
        encoding: 'utf8',
        timeout: 30000,
        stdio: 'pipe'
      });
      
      return result.toString();
    } catch (error: any) {
      return `Körningsfel: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`;
    }
  }
}