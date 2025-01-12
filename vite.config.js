import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    define: {
        'process.env': {},
    },
    server: {
        port: process.env.PORT || 10000, // Render's default port
        strictPort: true, // Ensures Vite binds only to the specified port
    },
});
