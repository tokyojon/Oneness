
bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/oneness
git pull
npm ci
npm run build
pm2 reload oneness
