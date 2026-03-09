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
      },
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'worker',
      script: './node_modules/.bin/tsx',
      args: 'src/scraper/worker.ts',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/dev/null',
      out_file: '/dev/null',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
