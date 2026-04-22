#!/bin/bash
set -e

mkdir -p /vercel/output/static

# Copy all HTML files and page directories
cp index.html /vercel/output/static/
cp -r pages /vercel/output/static/

# Vercel Build Output API config
cat > /vercel/output/config.json << 'EOF'
{"version": 3}
EOF

echo "Build complete. Files:"
find /vercel/output/static -name "*.html" | head -30
