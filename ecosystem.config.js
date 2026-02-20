module.exports = {
    apps: [{
        name: 'turismo-combita',
        script: 'backend/server.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '300M',
        env: {
            NODE_ENV: 'production',
            PORT: 3001
        },
        // Logs
        error_file: './logs/error.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        // Graceful shutdown
        kill_timeout: 10000,
        listen_timeout: 5000
    }]
};
