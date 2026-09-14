BALOO EXTENSION – SAMMANFATTNING OCH INSTALLATION

VAD JAG HAR BYGGT
-----------------
1. Skapat en ny, fristående VSCodium/VS Code-extension i mappen "baloo-extension/".
   - Denna är helt separat från ditt befintliga Electron-projekt ("extension/") så det krockar inte.
   
2. Grundläggande filstruktur:
   - package.json        → Extension-manifest (namn, kommandon, inställningar)
   - tsconfig.json       → TypeScript-inställningar
   - src/extension.ts    → Aktiveringspunkt när extensionen startas
   - src/balooAgent.ts   → Agent-kärna med registry för providers
   - src/providers/
       - ollamaProvider.ts → Exempelprovider (gratis, lokalt, obegränsad användning)
       - dummyProvider.ts  → Testprovider för demo
   - media/panel.html    → Webview-gränssnitt med textinmatning och "+" knapp

3. Funktioner:
   - Baloo kan agera som både språkmodell och agent.
   - Du kan chatta med Baloo via en panel i VSCodium.
   - Knappen "+" låter dig lägga till fler providers efterhand.
   - Inställningar lagras i VSCodiums settings (ingen .env-fil krävs i repot).

REKOMMENDERAD PROVIDER (GRATIS, INGET ABONNEMANG, OBEGRÄNSAD)
--------------------------------------------------------------
- **Ollama** – Öppen källkod, körs lokalt på din dator. 
  - Ingen API-nyckel krävs.
  - Obegränsad användning (begränsad endast av din hårdvara).
  - Ladda ner från: https://ollama.com
  - Standard-adress i extensionen: http://localhost:11434

HUR DU INSTALLERAR OCH TESTAR
------------------------------
1. Öppna en terminal och navigera till mappen:
   > cd baloo-extension

2. Installera beroenden:
   > npm install

3. Bygg TypeScript-koden:
   > npm run compile

4. Öppna mappen i VSCodium (eller VS Code):
   > code .

5. Tryck F5 för att starta "Extension Development Host" (ett nytt VSCodium-fönster öppnas).

6. I det nya fönstret, öppna kommandopaletten (Ctrl+Shift+P eller Cmd+Shift+P) och skriv:
   > Baloo: Show Assistant Panel

7. En panel öppnas där du kan:
   - Skriva frågor till Baloo
   - Klicka på "+" för att lägga till fler providers
   - Se svaret direkt i panelen

HUR DU LÄGGER TILL FLER PROVIDERS
---------------------------------
1. Skapa en ny fil i "src/providers/", t.ex. "openaiProvider.ts".
2. Implementera ett gränssnitt (interface) med en metod "call(prompt): Promise<string>".
3. Registrera providern i "balooAgent.ts" så den blir tillgänglig i panelen.
4. Om du vill ha en knapp för just den providern, lägg till den i panel.html och koppla ett meddelande i extension.ts.

VIKTIGT
-------
- Lagra ALDRIG API-nycklar i kod eller i filer som delas.
- Använd VSCodiums settings (workspace eller user settings) för känsliga nycklar.
- Om du behöver expert-hjälp från en extern tjänst kan Baloo (agentdelen) anropa den aktuella providern och returnera resultatet.
