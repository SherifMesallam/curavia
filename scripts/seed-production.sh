#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# seed-production.sh
# Seeds the deployed Render database with base data and patient/review data.
#
# Usage:
#   ./scripts/seed-production.sh <RENDER_DATABASE_URL>
#
# Example:
#   ./scripts/seed-production.sh "postgresql://curavia:pass@dpg-xxx.oregon-postgres.render.com/curavia"
#
# The URL is printed on your Render dashboard → PostgreSQL → Info → External URL
# ─────────────────────────────────────────────────────────────────────────────

set -e

PROD_DB_URL="${1:-}"

if [ -z "$PROD_DB_URL" ]; then
  echo ""
  echo "  ERROR: No database URL provided."
  echo ""
  echo "  Usage: ./scripts/seed-production.sh \"<RENDER_EXTERNAL_DATABASE_URL>\""
  echo ""
  echo "  Find it at: Render dashboard → your PostgreSQL service → Info → External Database URL"
  echo ""
  exit 1
fi

echo ""
echo "  ⚠  This will seed the PRODUCTION database."
echo "  URL: ${PROD_DB_URL:0:60}..."
echo ""
read -p "  Are you sure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "  Aborted."
  exit 0
fi

echo ""
echo "  [1/2] Running base seed (admin, doctors, specializations, procedures)..."
DATABASE_URL="$PROD_DB_URL" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

echo ""
echo "  [2/2] Running patient & review seed..."
DATABASE_URL="$PROD_DB_URL" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-patients.ts

echo ""
echo "  ✓ Production database seeded successfully!"
echo ""
echo "  You can now log in at your Render URL with:"
echo "    Admin:   admin@curavia.com / admin123"
echo "    Patient: sarah.johnson@example.com / password123"
echo ""
