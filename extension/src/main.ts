import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const TEXT_FILE = path.join(__dirname, '..', '..', 'mastertext.txt');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));
}

if (typeof app.whenReady === 'function') {
  app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('baloo.loadText', async () => {
      const { loadText } = await import('./baloo');
      return loadText();
    });

    ipcMain.handle('baloo.saveText', async (_event: any, lines: string[]) => {
      const { saveText } = await import('./baloo');
      saveText(lines);
      return { ok: true };
    });

    ipcMain.handle('baloo.processNextBlock', async (_event: any, lines: string[]) => {
      const { processWholeFile } = await import('./baloo');
      return processWholeFile(lines);
    });

    ipcMain.handle('baloo.stats', async (_event: any, lines: string[]) => {
      const { stats } = await import('./baloo');
      return stats(lines);
    });

    ipcMain.handle('baloo.chunks', async (_event: any, lines: string[]) => {
      const { makeChunks } = await import('./baloo');
      return makeChunks(lines);
    });

    ipcMain.handle('baloo.analyze', async (_event: any, lines: string[]) => {
      const { analyze } = await import('./baloo');
      return analyze(lines);
    });

    ipcMain.handle('baloo.saveLearnedRules', async (_event: any, rules: any) => {
      const { saveLearnedRules } = await import('./baloo');
      saveLearnedRules(rules);
      return { ok: true };
    });

    ipcMain.handle('baloo.loadLearnedRules', async () => {
      const { loadLearnedRules } = await import('./baloo');
      return loadLearnedRules();
    });

    ipcMain.handle('baloo.saveLearnedColors', async (_event: any, colors: any) => {
      const { saveLearnedColors } = await import('./baloo');
      saveLearnedColors(colors);
      return { ok: true };
    });

    ipcMain.handle('baloo.loadLearnedColors', async () => {
      const { loadLearnedColors } = await import('./baloo');
      return loadLearnedColors();
    });
  });
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});