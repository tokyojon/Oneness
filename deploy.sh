set -euo pipefail
cd /var/www/oneness
git pull
npm install
npm run build
pm2 reload oneness
