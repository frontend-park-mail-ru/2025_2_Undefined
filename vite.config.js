// vite.config.js
import { defineConfig } from 'vite';
import { resolve, path } from 'path';
import handlebarsPlugin from '@yoichiro/vite-plugin-handlebars';

export default defineConfig({
    // Root directory with source files
     resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets')
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
