#!/bin/bash

# Export React Email templates to static HTML and copy them straight into the
# backend. Kebab-case filenames are converted to the backend's snake_case names
# (e.g. account-reactivated.html -> account_reactivated.html). Existing backend
# templates with a matching name are overwritten.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/out"
BACKEND_DIR="$PROJECT_DIR/../backend/app/templates/emails"

echo "Exporting email templates..."
cd "$PROJECT_DIR"
pnpm export

if [ ! -d "$OUTPUT_DIR" ]; then
  echo "  No output directory found. Check for errors above."
  exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
  echo "  Backend templates dir not found: $BACKEND_DIR"
  exit 1
fi

echo ""
echo "Copying to backend ($BACKEND_DIR):"
echo "===================================="

for src in "$OUTPUT_DIR"/*.html; do
  base="$(basename "$src" .html)"
  dest_name="$(echo "$base" | tr '-' '_').html"
  cp "$src" "$BACKEND_DIR/$dest_name"
  echo "  $base.html -> $dest_name"
done

echo ""
echo "Done."
