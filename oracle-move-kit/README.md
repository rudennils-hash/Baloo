# Oracle-move-kit – Baloo

Det här är ett komplett migrations-kit för att flytta projektet, tiermux-extensionen
och alla chattar till Oracle Cloud Alltid-Gratis.

Allt som behövs ligger i den här mappen (eller packat i `baloo-full-backup.tar.gz`
som ligger bredvid när du kör `pack.ps1`).

## Innehåll

| Fil | Vad den gör |
|-----|-------------|
| `pack.ps1` | Samlar in projekt + VSCodium-data + chattar till `baloo-full-backup.tar.gz` |
| `server-setup.sh` | Installerar allt på Oracle: Docker, VS Codium Server, Gitea, Nginx, Let's Encrypt, bot, migrerar backup |
| `nginx-baloo.conf` | Nginx-reverse-proxy-konfig (webbsökningar till VS Codium Server) |
| `docker-compose.gitea.yml` | Gitea + databas (github-liknande, med dina egna repon) |
| `codium.service` | Systemd-tjänst som startar VS Codium Server automatiskt |
| `pw/` | Lösenord för servrarna (skapa `docker-mailserver.env` och `gitea.env`) |

## Så här går vi tillväga

### Fas 1 – Jag packar dina data lokalt (gör jag nu)
- Kör `powershell -File pack.ps1`
- Skapar `baloo-full-backup.tar.gz` med:
  - allt under `C:\Vgds Baloo` (dvs hela projektet)
  - `%APPDATA%\VSCodium\User` (settings + extensions + keybindings)
  - tiermux-chattar från workspaceStorage
  - din extension (om installerad)

### Fas 2 – Du skapar Oracle-kontot (bara du kan)
1. Gå till https://www.oracle.com/cloud/sign-in.html → **Sign up**
2. Validera mejl + telefon, ange kort (faktureras inte)
3. Skapa gratis instans (Ampere A1, Ubuntu 22.04/24.04)
4. Ladda ned/lagra **SSH-nyckel** (privat + publik)
5. Ge mig **IP-adressen** + (privat) nyckel → jag installerar via SSH

### Fas 3 – Jag installerar allt på servern (jag gör)
- `server-setup.sh` skapar: Docker + containers, VS Codium Server med dina inställningar,
  Gitea, Nginx med https, säkerhetsuppsättning (UFW/iptables), bot
- Jag överför och packar upp backupen och startar allt

### Fas 4 – Du hittar och startar allt
Allt listas i `README.md` (och jag ger dig en tydlig start-guide här).

## Viktigt om Oracle 2026
Sedan juni 2026 är alltid-gratis-nivån **2 OCPU / 12 GB RAM / 200 GB lagring**
(den gamla specen 4+24 gäller inte längre för nya konton). Fortfarande helt gratis.

## Skapa lösenord innan du kör
Lägg dessa filer i `pw/`:
- `pw/docker-mailserver.env` – innehåller `[email protected]=<lösenord>` (används av mailservern)
- `pw/gitea.env` – innehåller `GITEA__database__PASSWD=<lösenord>` och `GITEA__server__ROOT_URL=https://<din-domän>/`

(Be mig generera dem, eller använd en lösenordsgenerator själv.)