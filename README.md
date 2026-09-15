# Baloo

Autonom AI-agent och molnstack för att bygga appar – VS Code-tillägg, Electron-skrivbordsapp och mobilapp, med egen self-hosted molntjänst.

## Komponenter

| Mapp | Beskrivning |
|---|---|
| `baloo-extension/` | VS Code / VSCodium-tillägg (agentkärna, minne, planerare, verktyg) |
| `extension/` | Electron-skrivbordsapp (frontend + main/preload) |
| `baloo-mobil/` | Mobilapp |
| `Baloo-safety/` | Auth-, session- och säkerhetsmodul |
| `baloo-cloud-kit/` | Self-hosted molnstack (Docker Compose, Caddy, Fly.io, Railway, Cloudflare) |
| `oracle-move-kit/` | Migreringsverktyg till molnet |

## Molnstack

`docker-compose.yml` startar:
- **code-server** – VS Code i webbläsaren (cloud IDE)
- **Gitea** – self-hosted Git
- **MinIO** – S3-kompatibel lagring
- **The Lounge** – chatt/IRL-historik
- **Caddy** – reverse proxy med automatisk HTTPS

Se `baloo-cloud-kit/` för deployment till Fly.io, Railway och Cloudflare Tunnel.

## Säkerhet

- `.env`, nycklar och `secrets/` pushas **aldrig** – läggs som secrets i deployment-miljön.
- `mastertext.txt` (lokal chatthistorik) stannar lokalt.

## Licens

[MIT](LICENSE)
