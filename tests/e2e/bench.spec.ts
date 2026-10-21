import { expect, test } from "@playwright/test";

test("bench: v1 over-matches, v2 fixes both false positives", async ({ page }) => {
  await page.goto("/settings/rules/compensation");
  await expect(page.getByText("Examples are yours. The bench never reads anyone's documents.")).toBeVisible();
  await expect(page.getByTestId("precision")).toHaveText("67%");
  await expect(page.locator('[data-example="fun-run"] [data-outcome="FP"]')).toBeVisible();
  await page.getByRole("button", { name: "v2", exact: true }).click();
  await expect(page.getByTestId("precision")).toHaveText("100%");
  await expect(page.getByTestId("diff-summary")).toContainText("fixed 2 false positives");
});

test("bench: editing the description re-scores live", async ({ page }) => {
  await page.goto("/settings/rules/compensation");
  await expect(page.getByTestId("precision")).toHaveText("67%");
  await page.getByLabel(/Description/).fill("Salary figures, compensation bands, bonus and equity for named employees");
  await expect(page.getByTestId("precision")).toHaveText("100%");
  await expect(page.getByText("draft", { exact: true })).toBeVisible();
});

test("bench: audience explainer shows the fun-run resolves to Priya only", async ({ page }) => {
  await page.goto("/settings/rules/compensation");
  await page.getByRole("button", { name: "v2", exact: true }).click();
  await page.locator('[data-example="fun-run"]').getByRole("button", { name: "Why this audience?" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Priya only");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("sharing rule: v2 is ready to enable auto-share", async ({ page }) => {
  await page.goto("/settings/rules/customer-calls");
  await expect(page.getByTestId("readiness")).toContainText("Not ready");
  await page.getByRole("button", { name: "v2", exact: true }).click();
  await expect(page.getByTestId("readiness")).toContainText("7 of 9 positives would auto-share, 2 go to the owner's Inbox, 0 false shares");
});

test("story renders the hero", async ({ page }) => {
  await page.goto("/story");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rules decide who sees what");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("story shows final impact numbers immediately", async ({ page }) => {
    await page.goto("/story");
    await page.getByTestId("impact-precision").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("impact-precision")).toHaveText("100%");
    await expect(page.getByTestId("impact-fp")).toHaveText("0");
    await expect(page.getByTestId("impact-readiness")).toContainText("Ready to enable auto-share");
  });
});

test("story has no horizontal scroll at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const path of ["/story", "/settings/rules/compensation"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
