// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebarsPlugin from '@yoichiro/vite-plugin-handlebars';

export default defineConfig({
    // Root directory with source files
         resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@api': resolve(__dirname, './src/api'),
            '@components': resolve(__dirname, './src/components'),
            '@utils': resolve(__dirname, './src/utils'),
            '@assets': resolve(__dirname, './src/assets'),
            // map React imports to the local my-react implementation
            'minireact': resolve(__dirname, './lib/my-react/src/index.js'),
            'minireact/jsx-runtime': resolve(__dirname, './lib/my-react/src/jsx-runtime.js'),
            'minireact/jsx-dev-runtime': resolve(__dirname, './lib/my-react/src/jsx-runtime.js'),
            'minireact-dom': resolve(__dirname, './lib/my-react/src/react-dom.js')
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
