import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 4102);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}/story`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
