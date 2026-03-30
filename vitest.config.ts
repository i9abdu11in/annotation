import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false, // Disable global APIs
    environment: 'jsdom', // Use jsdom for DOM simulation
    setupFiles: ['src/test-setup.ts'], // Global setup file
    include: ['src/**/*.spec.ts'], // Test file pattern
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
      ]
    }
  }
});
