import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // For server files (Node.js )
    files: ['src/**/*.js'],
    ignores: ['src/public/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Global variables Node.js
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off' // Enabling console in the server code
    }
  },
  {
    // For client files (browser)
    files: ['src/public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser, // Global browser variables
        alert: 'readonly',
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly'
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  }
];  