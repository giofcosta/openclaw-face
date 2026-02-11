module.exports = {
  apps: [
    {
      name: 'moltbot-face-production',
      script: 'npm',
      args: 'run start:prod',
      cwd: '/home/ubuntu/clawd/moltbot-face',
      env: {
        NODE_ENV: 'production',
        PORT: 18794,
      },
    },
    {
      name: 'moltbot-face-staging',
      script: 'npm',
      args: 'run start:staging',
      cwd: '/home/ubuntu/clawd/moltbot-face',
      env: {
        NODE_ENV: 'staging',
        PORT: 18795,
      },
    },
  ],
};
