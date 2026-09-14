import * as fs from 'fs';
import * as path from 'path';

export type LearnedColor = {
  name: string;
  description: string;
  help: string;
  color: string; // hex or rgba as string
  createdAt: string;
};

export type LearnedRule = {
  prefix?: string;
  label?: string;
  action: 'keep' | 'remove' | 'stada' | 'move' | 'rename';
  hint?: string;
  sample?: string;
};

export type SummaryItem = {
  title: string;
  lineNumber: number;
  context: string;
};

const RULES_PATH = path.join(__dirname, '..', '..', 'learned-rules.json');
const COLORS_PATH = path.join(__dirname, '..', '..', 'learned-colors.json');

export function loadText(): string[] {
  const file = path.join(__dirname, '..', '..', 'mastertext.txt');
  if (!fs.existsSync(file)) throw new Error('mastertext.txt saknas i projektroten');
  const content = fs.readFileSync(file, 'utf8');
  return content.split(/\r?\n/);
}

export function saveText(lines: string[]): void {
  const file = path.join(__dirname, '..', '..', 'mastertext.txt');
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
}

// Stats & chunking helper
export function stats(lines: string[]): { sizeBytes: number; lineCount: number } {
  const sizeBytes = Buffer.byteLength(lines.join('\n'), 'utf8');
  return { sizeBytes, lineCount: lines.length };
}

export function makeChunks(lines: string[], chunkSize = 1000): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }
  return chunks;
}

// Extract Baloo files - basic implementation
export function extractBalooFiles(lines: string[]): {
  lines: string[];
  extractedFiles: { originalPath: string; newPath: string; version: number }[];
  report: string;
} {
  const extractedFiles: { originalPath: string; newPath: string; version: number }[] = [];
  let report = 'Baloo extraction completed. ';
  const filePatterns = [
    /# extract:\s*(\/\S+)/i,
    /# version:\s*(\d+)/i,
  ];
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of filePatterns) {
      const match = lines[i].match(pattern);
      if (match) {
        if (pattern.source.startsWith('# extract')) {
          const originalPath = match[1];
          const fileName = path.basename(originalPath);
          const newPath = path.join(__dirname, '..', '..', 'baloo', fileName);
          const dir = path.dirname(newPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          if (fs.existsSync(newPath)) {
            const content = fs.readFileSync(newPath, 'utf8');
            const versionMatch = content.match(/version:\s*(\d+)/i);
            const version = versionMatch ? parseInt(versionMatch[1], 10) + 1 : 1;
            fs.writeFileSync(newPath, `version: ${version}\n${content}`, 'utf8');
            extractedFiles.push({ originalPath, newPath, version });
          } else {
            fs.writeFileSync(newPath, `version: 1\n`, 'utf8');
            extractedFiles.push({ originalPath, newPath, version: 1 });
          }
          report += `Extracted ${originalPath} to ${newPath}. `;
        } else if (pattern.source.startsWith('# version')) {
          const version = parseInt(match[1], 10);
          report += `Version ${version} detected. `;
        }
      }
    }
  }
  return { lines, extractedFiles, report };
}

// Color cleaning with learned rules
export function colorCleaner(line: string, learnedRules: { [key: string]: string }): { keep: boolean; raw: string } {
  for (const prefix in learnedRules) {
    if (line.startsWith(prefix)) {
      const action = learnedRules[prefix];
      if (action === 'remove') {
        return { keep: false, raw: line };
      } else if (action === 'stada') {
        return { keep: true, raw: line.replace(prefix, '').trim() };
      }
    }
  }
  return { keep: true, raw: line };
}

export function processWholeFile(lines: string[], learnedRules?: { [key: string]: string }): {
  lines: string[];
  report: string;
} {
  const rules = learnedRules || {};
  const cleaned: string[] = [];
  const removed: string[] = [];
  for (const line of lines) {
    const result = colorCleaner(line, rules);
    if (result.keep) {
      cleaned.push(result.raw);
    } else {
      removed.push(result.raw);
    }
  }
  const report = `Rensade ${removed.length} rader, behöll ${cleaned.length} rader.`;
  return { lines: cleaned, report };
}

// Learned rules management
function loadJson(path: string, fallback: any) {
  try {
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to load json:', path, e);
  }
  return fallback;
}

export function loadLearnedRules(): { [key: string]: string } {
  return loadJson(RULES_PATH, {});
}

export function saveLearnedRules(rules: { [key: string]: string }): void {
  fs.writeFileSync(RULES_PATH, JSON.stringify(rules, null, 2), 'utf8');
}

export function loadLearnedColors(): Record<string, LearnedColor> {
  return loadJson(COLORS_PATH, {
    radera: { name: 'Radera', description: 'Ta bort denna rad', help: 'Radera raden helt', color: '#f38ba8', createdAt: new Date().toISOString() },
    stada: { name: 'Städa/Rensa', description: 'Ta bort skräp/kolumner', help: 'Städar texten', color: '#a6e3a1', createdAt: new Date().toISOString() },
    kommentar: { name: 'Kommentar', description: 'Kommentar/funktionsbeskrivning', help: 'Markerar kommentarer', color: '#cba6f7', createdAt: new Date().toISOString() },
    baloo: { name: 'Baloo-fil', description: 'Hör till Baloo-kodbas', help: 'Markerar Baloo-relevanta rader', color: '#89b4fa', createdAt: new Date().toISOString() },
    special: { name: 'Special', description: 'Särskild markering', help: 'Används för specialfall', color: '#f9e2af', createdAt: new Date().toISOString() },
  });
}

export function saveLearnedColors(colors: Record<string, LearnedColor>): void {
  fs.writeFileSync(COLORS_PATH, JSON.stringify(colors, null, 2), 'utf8');
}

// Summary/overview analysis of the whole file with line numbers.
// Uses learned rules to detect project-relevant headings.
export function analyze(lines: string[]): SummaryItem[] {
  const rules = loadLearnedRules();
  const items: SummaryItem[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let title = line;
    for (const prefix in rules) {
      if (line.startsWith(prefix)) {
        title = line.replace(prefix, '').trim();
        break;
      }
    }
    const key = `${title}|${Math.min(i, lines.length - 1)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      title,
      lineNumber: i + 1,
      context: line,
    });
    if (items.length >= 500) break;
  }
  return items;
}

// Learning helpers: record user preference
export function learnRule(prefix: string, action: LearnedRule['action'], hint?: string) {
  const rules = loadLearnedRules();
  rules[prefix] = action;
  if (hint) {
    const stored = (rules as any)['__meta__'] || {};
    stored[prefix] = { action, hint };
    (rules as any)['__meta__'] = stored;
  }
  saveLearnedRules(rules);
}
