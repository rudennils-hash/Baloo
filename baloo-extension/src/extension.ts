import * as vscode from 'vscode';
import { BalooCore } from './balooCore';
import { ProviderManager } from './providers/providerManager';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('Baloo');

    // Skapa BalooCore-instansen
    const balooCore = new BalooCore(context, outputChannel);

    // Registrera kommandon
    context.subscriptions.push(
        vscode.commands.registerCommand('baloo.showPanel', () => {
            // Skapa eller visa panel
            const panel = vscode.window.createWebviewPanel(
                'balooPanel',
                'Baloo AI Assistant',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    // Tillåt inline scripts för att hantera meddelanden
                    // (OBS: i produktionskod bör du begränsa detta)
                    localResourceRoots: [
                        vscode.Uri.file(context.extensionPath)
                    ]
                }
            );

            // Ställ in HTML-innehåll
            panel.webview.html = getWebviewContent(context, balooCore);

            // Hantera meddelanden från webbläsaren
            panel.webview.onDidReceiveMessage(
                message => handleWebviewMessage(message, panel, balooCore, outputChannel),
                undefined,
                context.subscriptions
            );
        })
    );

    // Starta panel om den inte redan är öppen
    vscode.commands.executeCommand('baloo.showPanel');
}

export function deactivate() {}

function getWebviewContent(context: vscode.ExtensionContext, balooCore: BalooCore): string {
    const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Baloo AI Assistant</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 10px; }
        #output { white-space: pre-wrap; border: 1px solid #ccc; padding: 10px; height: 300px; margin-bottom: 10px; }
        #inputBox { width: 100%; padding: 8px; }
        button { margin-top: 5px; }
    </style>
</head>
<body>
    <h2>Baloo AI Assistant</h2>
    <div id="output"></div>
    <input id="inputBox" type="text" placeholder="Skriv en fråga eller ge en order..." />
    <button id="sendBtn">Skicka</button>
    <button id="addProviderBtn">+ Lägg till provider</button>
    <script>
        const vscode = acquireVsCodeApi();

        // Skicka meddelande till extension
        function postMessageToExtension(message) {
            vscode.postMessage(message);
        }

        // Hantera meddelanden från extension
        vscode.onDidReceiveMessage(message => {
            if (message.command === 'setOutput') {
                document.getElementById('output').textContent = message.text;
            } else if (message.command === 'appendOutput') {
                const out = document.getElementById('output');
                out.textContent += message.text + '\\n';
            }
        });

        // Skicka knapptryck
        document.getElementById('sendBtn').addEventListener('click', () => {
            const input = document.getElementById('inputBox').value.trim();
            if (input) {
                postMessageToExtension({ command: 'ask', text: input });
                document.getElementById('inputBox').value = '';
            }
        });

        // Lägga till provider (placeholder)
        document.getElementById('addProviderBtn').addEventListener('click', () => {
            postMessageToExtension({ command: 'addProvider' });
        });
    </script>
</body>
</html>
    `;
    return html;
}

function handleWebviewMessage(message, panel, balooCore, outputChannel) {
    switch (message.command) {
        case 'ask':
            balooCore.execute(message.text).then(result => {
                outputChannel.appendLine(`[Baloo] ${message.text}`);
                // Skicka resultatet tillbaka till webbläsaren
                panel.webview.postMessage({ command: 'setOutput', text: result });
            }).catch(err => {
                outputChannel.appendLine(`[Baloo] Fel: ${err.message}`);
                panel.webview.postMessage({ command: 'setOutput', text: `Fel: ${err.message}` });
            });
            break;

        case 'addProvider':
            // I en verklig implementation skulle vi kunna öppna en snabbmeny eller dialog.
            // För nu bara logga.
            outputChannel.appendLine('[Baloo] Klickade på "+ Lägg till provider" (placeholder)');
            break;

        default:
            console.warn('Okänd meddelande från webview:', message);
    }
}