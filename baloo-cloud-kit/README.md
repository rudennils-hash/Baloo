# Baloo Cloud Kit – 32 GB Gratis Kluster (2026)
Eget, självbyggt, gratis moln utan kreditkort. Ingen laptop som server.

## Arkitektur (utan överdrivningar)
| Lager | Tjänst | RAM/Resurs | Kostnad |
|---|---|---|---|
| **Compute** | Fly.io | 256 MB/instans × N | Gratis tier |
| **Containers/Microservices** | Railway | 512 MB/container × N | Gratis tier |
| **Routing/DNS/HTTPS/CDN** | Cloudflare | Obegränsat | Gratis |
| **Frontend/App-distribution** | Cloudflare Pages + GitHub Releases | Obegränsat | Gratis |
| **Lagring** | MinIO (på Railway/Fly) | Egen bucket | Gratis |
| **Databas** | PostgreSQL (Railway/Fly) | Egen instans | Gratis |
| **Repo/CI** | GitHub + valfritt Gitea | Obegränsat | Gratis |
| **Chat** | The Lounge (Railway/Fly) | Egen container | Gratis |
| **Editor** | code-server (Railway/Fly) | Egen container | Gratis |
| **Nätverk** | Tailscale | Obegränsat | Gratis |
| **Backup** | Cloudflare R2 eller Backblaze B2 | Egen bucket | Gratis tier |

> Obs: Vi skapar många små instancers/containers och bygger ett logiskt kluster. Det är den enda vägen till samlat RAM utan att betala.

## Konto du redan skapat (klar)
- [x] GitHub
- [x] Fly.io
- [x] Railway
- [x] Cloudflare
- [x] Tailscale

## Vad du behöver göra nu
1. Installera Docker Desktop på din Windows-dator (för att bygga och testa lokalt)
2. Skapa en GitHub-repo för Baloo (privata repo är gratis)
3. Följ stegen i `SETUP-GUIDE.md`

## Filer i detta kit
- `SETUP-GUIDE.md` – komplett installationsguide (svenska)
- `docker-compose.yml` – hela stacken för lokal test eller VPS
- `fly/` – Fly.io konfiguration
- `railway/` – Railway konfiguration
- `cloudflare/` – Cloudflare Pages + DNS konfiguration
- `scripts/` – automatiska installeringsskript
