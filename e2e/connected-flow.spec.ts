import { expect, test } from "@playwright/test";
import { completeGuidedDemo, verifyReportAfterRefresh } from "./helpers";

const connectedEnabled =
  process.env.E2E_CONNECTED === "1" &&
  Boolean(process.env.E2E_STORAGE_STATE);

test.use({
  storageState: process.env.E2E_STORAGE_STATE || undefined,
});

test("connected: authenticated run persists after refresh", async ({
  page,
  request,
}) => {
  test.skip(
    !connectedEnabled,
    "Set E2E_CONNECTED=1 and E2E_STORAGE_STATE after signing in to a staging Supabase project.",
  );

  await page.goto("/login");
  await expect(page.getByText("登录并同步学习进度")).toBeVisible();
  const response = await request.get("/api/runs");
  expect(response.ok()).toBeTruthy();

  await completeGuidedDemo(page);
  await verifyReportAfterRefresh(page);
  await expect(page.getByText("CONNECTED", { exact: true }).first()).toBeVisible();
});
