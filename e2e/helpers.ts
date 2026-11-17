import { expect, type Page } from "@playwright/test";

const workspacePath =
  "/workspace/ai-software-engineering/release-defect/guided-demo";

async function openTool(page: Page, name: string) {
  await page.getByRole("button", { name, exact: true }).first().click();
}

export async function completeGuidedDemo(page: Page) {
  await page.goto(workspacePath);
  await expect(page.getByText("任务中心", { exact: true }).first()).toBeVisible();

  await openTool(page, "消息中心");
  await page.getByRole("button", { name: /发布前缺陷/ }).first().click();

  await openTool(page, "项目说明");
  await page.getByRole("button", { name: "保存项目说明", exact: true }).click();

  await openTool(page, "AI 助手");
  await page.getByRole("button", { name: /BUILD/ }).click();
  await page.getByRole("button", { name: "发送请求", exact: true }).click();
  await page.getByRole("button", { name: "应用示例补丁", exact: true }).click();

  await openTool(page, "测试与预览");
  await page.getByRole("button", { name: "运行模拟测试", exact: true }).click();
  await page.getByRole("button", { name: "应用演示修复", exact: true }).click();
  await page.getByRole("button", { name: "运行模拟测试", exact: true }).click();

  await openTool(page, "版本协作");
  await page.getByRole("button", { name: "暂存已验证修改", exact: true }).click();
  await page.getByRole("button", { name: "提交", exact: true }).click();
  await page.getByRole("button", { name: "打开 PR", exact: true }).click();
  await page.getByRole("button", { name: "批准", exact: true }).click();

  await openTool(page, "发布");
  await page.getByRole("button", { name: "正式环境", exact: true }).click();
  await page.getByRole("button", { name: "发布模拟版本", exact: true }).click();
  await expect(page.getByText("发布完成").first()).toBeVisible();
}

export async function verifyReportAfterRefresh(page: Page) {
  await page.reload();
  await openTool(page, "发布");
  await expect(page.getByText("RELEASED", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /查看学习报告/ }).first().click();
  await expect(page.getByText("已完成操作与关键事件")).toBeVisible();
}
