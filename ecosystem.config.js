module.exports = {
  apps: [{
    name: 'ganpati-billing-api',
    script: './backend/server.js',
    cwd: __dirname,
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '512M',
    env: { NODE_ENV: 'production' },
    time: true,
  }],
};