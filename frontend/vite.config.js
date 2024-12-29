import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [react()],
        css: {
            postcss: './postcss.config.js',
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
            extensions: ['.js', '.jsx'],
        },
        server: {
            host: '0.0.0.0',
            port: 5173,
            proxy: {
                '/api': {
                    target: env.VITE_BACKEND_URL,
                    changeOrigin: true,
                    secure: false,
                },
            },
            https: {
                key: fs.readFileSync(path.resolve(__dirname, '../certificates/key.pem')),
                cert: fs.readFileSync(path.resolve(__dirname, '../certificates/cert.pem')),
            },
        },
        esbuild: {
            loader: 'jsx',
            include: /src\/.*\.[jt]sx?$/,
            exclude: [],
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: {
                    '.js': 'jsx',
                    '.jsx': 'jsx',
                },
            },
        },
    };
});
