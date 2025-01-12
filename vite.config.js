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
        port: process.env.PORT || 8080,  // Use $PORT if available, fallback to 3000 for local dev
        strictPort: true,  // Ensure Vite strictly uses the specified port
        host: '0.0.0.0', 
    }
});
