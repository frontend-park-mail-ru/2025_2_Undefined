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
      '@assets': resolve(__dirname, './src/assets')
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
        },
    },
});
