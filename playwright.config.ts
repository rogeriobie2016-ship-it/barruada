import { defineConfig, devices } from '@playwright/test';

// Um fluxo por jogo, em tela de celular. O servidor é o site já gerado (npm run build).
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4399',
    ...devices['Pixel 7'],
  },
  webServer: {
    command: 'npm run preview -- --port 4399 --host 127.0.0.1',
    url: 'http://127.0.0.1:4399',
    reuseExistingServer: true,
  },
});
