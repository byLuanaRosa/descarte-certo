import { defineConfig, devices } from "@playwright/test";

const porta = 3100;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${porta}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${porta}`,
    port: porta,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
