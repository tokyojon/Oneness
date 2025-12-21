module.exports = {
  apps: [
    {
      name: 'oneness',
      cwd: '/var/www/oneness',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 5000,
      kill_timeout: 5000
    }
  ]
}
