// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebarsPlugin from '@yoichiro/vite-plugin-handlebars';
import path from 'path';

const root = path.join(__dirname, '/lib/react');
const resolvePkg = (...parts) => path.join(root, ...parts, 'src', 'index.js');

export default defineConfig({
    // Root directory with source files
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@api': resolve(__dirname, './src/api'),
            '@components': resolve(__dirname, './src/components'),
            '@utils': resolve(__dirname, './src/utils'),
            '@assets': resolve(__dirname, './src/assets'),
            'preact/hooks': resolvePkg('hooks'),
            'preact/jsx-runtime': resolvePkg('jsx-runtime'),
            'preact/jsx-dev-runtime': resolvePkg('jsx-runtime'),
            preact: resolvePkg(''),
            'react-dom': resolvePkg('compat'),
            react: resolvePkg('compat')
        }
    },

    // The directory for the build
    build: {
        outDir: './dist',
        emptyOutDir: true,
    },

    // Plugins
    plugins: [
        // Handlebars
        handlebarsPlugin({
            templateFileExtension: '.hbs',
            partialsDirectoryPath: resolve(__dirname, 'src'),
            optimizePartialRegistration: true,
            transformIndexHtmlOptions: {
                context: async () => {
                    return Promise.resolve({ keyword: 'static' });
                },
            },
        }),
    ],

    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
            '/api/v1/message/ws': {
                target: 'ws://localhost:8080',
                ws: true,
                changeOrigin: true,
            },
        },
    },


});
