import { defineConfig } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools'
import vue from '@vitejs/plugin-vue';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VueDevTools()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: '3000'
    },
    build: {
        rollupOptions: {
            maxParallelFileOps: 20, // Lowers simultaneous memory consumption
        },
    },
});