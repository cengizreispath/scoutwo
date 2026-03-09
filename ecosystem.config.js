module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
    // Worker disabled temporarily - path alias issue
    // {
    //   name: 'worker',
    //   script: './node_modules/.bin/tsx',
    //   args: 'src/scraper/worker.ts',
    // },
  ],
};
