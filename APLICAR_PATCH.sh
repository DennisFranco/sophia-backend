#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Uso: ./APLICAR_PATCH.sh /ruta/al/sophia-backend"
  exit 1
fi
if [ ! -f "$TARGET/package.json" ]; then
  echo "No encuentro package.json en $TARGET"
  exit 1
fi
BASE="$(cd "$(dirname "$0")" && pwd)"
for f in \
  src/main.ts \
  src/config/ai.config.ts \
  src/config/env.validation.ts \
  src/infrastructure/ai/providers/ai-provider.interface.ts \
  src/infrastructure/ai/providers/gemini.provider.ts \
  src/modules/tutor/application/services/tutor.service.ts \
  scripts/test-gemini.mjs \
  package.json; do
  mkdir -p "$TARGET/$(dirname "$f")"
  cp "$BASE/$f" "$TARGET/$f"
  echo "OK $f"
done

echo "Patch aplicado. Ejecuta: npm install && npm run build && npm test"
