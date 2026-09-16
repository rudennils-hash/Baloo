#!/bin/sh
set -eu

# --- Se till att mörkt tema finns vid allra första start (och aldrig skrivs över) ---
SEED_DIR="/home/coder/seed"
DATA_DIR="/home/coder/.local/share/code-server"
USER_SETTINGS="${DATA_DIR}/User/settings.json"

mkdir -p "$(dirname "$USER_SETTINGS")"

# Bara seeda om settings.json saknas (så att användarens egna val bevaras)
if [ ! -f "$USER_SETTINGS" ]; then
  cp -r "$SEED_DIR"/. "$DATA_DIR"/ 2>/dev/null || true
  echo "[entrypoint] Seeded default settings to $USER_SETTINGS"
fi

# --- Använd officiella code-server-entrypoint (fixuid + dumb-init) ---
exec /usr/bin/entrypoint.sh "$@"