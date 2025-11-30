module.exports = {
  apps: [
    {
      name: 'vikings-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3202
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      // Log rotation
      log_type: 'json',
      time: true
    },
    {
      name: 'vikings-admin-app',
      cwd: './admin-app',
      script: 'npx',
      args: 'vite preview --port 3201 --host',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3201
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false
    },
    {
      name: 'vikings-user-app',
      cwd: './user-app',
      script: 'npx',
      args: 'vite preview --port 3200 --host',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3200
      },
      error_file: './logs/user-error.log',
      out_file: './logs/user-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false
    }
  ]
};
