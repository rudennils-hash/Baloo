# Cloudflare Konfiguration för Baloo

## 1. Lägg till domän
- Gå till Cloudflare Dashboard → **Websites** → **Add a Site**
- Välj din domän (t.ex. `baloo.se` eller `vgds.app`)
- Välj **Free** plan

## 2. Uppdatera namnservrar
- Cloudflare visar dig två namnservrar (t.ex. `lara.ns.cloudflare.com`)
- Uppdatera dessa där du köpte din domän

## 3. DNS Records (vänta 5-60 min)
```
Type    Name    Value                   Proxy
A       @       <Fly.io IP>             Proxied (orange moln)
CNAME   www     <Railway domain>        Proxied (orange moln)
CNAME   chat     <Railway domain>       Proxied (orange moln)
```

## 4. SSL/TLS
- Gå till **SSL/TLS** → **Overview**
- Välj **Full** eller **Full (Strict)**

## 5. Pages (för frontend)
- Gå till **Workers & Pages** → **Pages** → **Create a project**
- Koppla till ditt GitHub-repo
- Bygginställningar: **Framework preset: None**, **Build command: npm run build**, **Output directory: dist**

## 6. R2 (för backup, valfritt)
- Gå till **R2** → **Create bucket**
- Använd S3-kompatibla verktyg för att ladda upp builds
