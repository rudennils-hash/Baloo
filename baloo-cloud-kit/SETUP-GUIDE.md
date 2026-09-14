# Baloo Cloud Kit – Installationsguide (Svenska)
Kör dessa steg i ordning. Inget kreditkort krävs.

## Förberedelser
1. Installera [Docker Desktop](https://www.docker.com/products/docker-desktop/) på Windows
2. Installera [Git](https://git-scm.com/downloads)
3. Öppna PowerShell eller CMD som administratör

## Steg 1: Klona Baloo-projektet
```bash
# Om du redan har projektet i "C:\Vgds Baloo" kan du hoppa över detta
# Annars: klona från GitHub när du skapat ett repo
git clone https://github.com/DITT-ANVANDARNAMN/baloo.git
cd baloo
```

## Steg 2: Starta lokal stack (valfritt – för test)
```bash
cd baloo-cloud-kit
docker-compose up -d
```

Öppna sedan:
- **code-server**: http://localhost:8443
- **Gitea**: http://localhost:3000
- **MinIO**: http://localhost:9001
- **The Lounge**: http://localhost:9000
- **Portainer**: http://localhost:9443
- **Grafana**: http://localhost:3001

## Steg 3: Railway – första microservicen
1. Gå till https://railway.app/new
2. Välj **"Deploy from GitHub repo"** och välj ditt Baloo-repo
3. Railway känner automatiskt av `railway.json` och bygger
4. Sätt miljövariabler under **Variables** (se `railway/README.md`)
5. När deployment är klar: **Settings → Domains → Generate Domain**

## Steg 4: Fly.io – första containern
```bash
# Installera Fly.io CLI (Windows - PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Logga in
fly auth login

# Starta en ny app (exempel för Baloo API)
fly launch --name baloo-api --no-deploy

# När frågan om Dockerfile kommer: Nej (vi använder befintlig)
# Välj region: nära dig, t.ex. lhr (London) eller fra (Frankfurt)
```

## Steg 5: Cloudflare – DNS och CDN
1. Lägg till din domän i Cloudflare (om du inte har en: köp en på **gratis** via Cloudflare Registrar eller använd en gratis domän från **Freenom**)
2. Skapa DNS-record: `A` → `@` → din Fly.io IP
3. Skapa DNS-record: `CNAME` → `www` → din Railway domain
4. Aktivera **HTTPS** och **Always Use HTTPS**

## Steg 6: GitHub Actions – CI/CD
Varje gång du pushar till `main` ska GitHub Actions bygga och deploya.
Exempel-workflow finns i `.github/workflows/deploy.yml`.

## Steg 7: Baloo-migrering
Se `scripts/migrate.ps1` för hur du flyttar:
- Källkod
- VS Code/Codium-installningar (listan med extensions)
- Chattdata (mastertext.txt)
- API-nycklar (miljövariabler)

## Steg 8: Nästa
Säg bara "klar" när du har kört stegen, så hjälper jag dig konfigurera varje tjänst i ordning.
