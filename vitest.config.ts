import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/app'),
      '@app': resolve(__dirname, './src/app'),
      '@shared': resolve(__dirname, './src/app/shared'),
      '@testing': resolve(__dirname, './src/app/testing'),
    },
  },
});