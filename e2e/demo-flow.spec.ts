import { test } from "@playwright/test";
import { expect } from "@playwright/test";
import { completeGuidedDemo, verifyReportAfterRefresh } from "./helpers";

test("demo: complete, refresh, and open the learning report", async ({
  page,
  request,
}) => {
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).mode).toBe("demo");
  await completeGuidedDemo(page);
  await verifyReportAfterRefresh(page);
});
