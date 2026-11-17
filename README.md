# Itera Studio

AI 辅助软件开发互动学习平台。项目同时支持免登录 Demo 与 Supabase Connected 模式；核心场景已具备服务端权威状态、跨设备恢复和结构化 AI 评估。

## 技术栈

- Next.js 16.4.6，App Router
- React 19.3.0
- TypeScript
- Tailwind CSS 4.3.3
- Supabase Auth / PostgreSQL
- Zod 4.6.7
- Vitest 4.0.18
- Playwright 1.65.1

依赖版本记录在 `package.json` 与 `package-lock.json` 中。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

质量检查：

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## 页面

| 路径 | 作用 |
| --- | --- |
| `/` | 平台首页与演示入口 |
| `/courses` | 课程、模块、阶段、状态与继续学习入口 |
| `/workspace/ai-software-engineering/release-defect/guided-demo` | 核心三栏学习工作台 |
| `/records` | 当前浏览器与 Connected 服务端学习记录 |
| `/records/[runId]` | 操作事件与演示评价报告 |
| `/settings` | 语言、主题与摘要指令偏好 |
| `/admin/content` | 课程配置只读预览与 Zod 校验结果 |
| `/login` | GitHub 或邮箱链接登录 |
| `/api/health` | 运行时模式和依赖配置检查 |

## 完整演示流程

1. 从首页点击“体验演示”。
2. 在消息中心打开项目经理邮件。
3. 在项目说明中填入或编辑需求并保存。
4. 在 AI 助手切换到 Build，发送修改请求，应用示例补丁。
5. 在文件与差异中查看实际内容变化。
6. 在测试与预览中运行测试，观察失败。
7. 应用演示修复，再次运行测试。
8. 在版本协作中暂存、提交、打开 PR 并批准。
9. 切换到模拟正式环境，解决全部发布检查后发布。
10. 打开学习报告。

核心前置条件由 `lib/simulation/reducer.ts` 执行：

- 测试未通过时不能暂存或提交。
- 没有提交时不能打开 PR。
- PR 未批准、存在未提交修改或未选择正式环境时不能发布。
- 重新开始会保留旧运行记录，并创建独立的 run ID、新时间和空状态。

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需配置。`RUN_MODE=demo` 无需密钥；`RUN_MODE=connected` 需要 Supabase URL、anon key 和仅服务端使用的 service role key。

真实密钥不能提交到仓库。`SUPABASE_SERVICE_ROLE_KEY` 与 `LLM_API_KEY` 仅允许在服务端读取；任何 `NEXT_PUBLIC_` 变量都可能进入浏览器包，不得存放服务端密钥。

`/api/assistant` 使用统一请求契约：

- `DEMO_MODE=true`：确定性 Demo 响应。
- `DEMO_MODE=false` 且配置完整：使用 OpenAI-compatible 服务端适配器读取 `LLM_BASE_URL`、`LLM_MODEL` 和 `LLM_API_KEY`。
- 环境不完整时仍回退到 Demo 适配器，并明确返回 `adapter: "demo"`。
- Connected 工作台的助手请求由服务端发起，返回结构化 intent、covered criteria、evidence quote 和 grader。

## 状态和持久化

- Demo 模式把活跃运行、运行历史和偏好保存在当前浏览器 `localStorage`。
- Connected 模式通过 Supabase Auth 验证用户，由服务端 API 执行 Action，Run 和 Event 写入 PostgreSQL。
- 服务端状态使用 revision 乐观锁，防止多标签页静默覆盖。
- 学生通过 RLS 只能读取自己的运行和事件；浏览器不能直接写入权威运行状态。
- 工作台按钮只发送 Action；所有状态与事件仍由统一 reducer 修改。

## 已完成

- 首页、课程列表、学习工作台、学习记录、学习报告、设置和内容配置入口。
- 可配置的课程、模块、场景、任务步骤、工具范围、文件、消息、完成条件和反馈占位。
- 九个共享工具：任务、消息、项目说明、文件与差异、AI 助手、测试、版本、发布、摘要。
- 完整状态化演示流程、错误反馈、事件日志与刷新恢复。
- Demo / Connected 统一 RunStore、Supabase 登录、服务端运行与事件记录。
- 公共 Catalog 与完整 Scenario 分离，Connected 页面不接收隐藏补丁和修复答案。
- 结构化 AI 评估、证据引用、grader 降级与报告记录。
- 小屏幕工具／任务标签切换。
- Demo／Connected 数据与模型调用边界。
- Zod 课程配置和持久化入口校验。
- 关键 reducer 规则测试。
- Playwright Demo 流程：完成场景、刷新恢复、查看学习报告。
- 语言偏好已接通主导航与设置；课程标题和描述使用双语配置，详细工具课堂文案仍以中文为主。

## 模拟实现

- 消息、文件、代码差异、测试结果、分支、提交、PR、部署和 AI 回复均为教学模拟。
- “发布”不会调用 Vercel，只写入当前浏览器状态。
- 文档摘要使用预置演示数据，不是真实上传、PDF 提取或 LLM 生成。
- 模拟终端只呈现结果，不接受并执行真实系统命令。
- 报告中的评价是明确标注的占位内容，不是 AI 评分。

## 待接入

- 班级、任务分配与教师角色。
- 运行历史的长期归档与教师报告。
- Supabase Storage 文件上传、PDF/TXT 提取与对象权限。
- 摘要任务的服务端队列、自定义指令执行和异常路径处理。
- 正式题目、剧情、评分规则、提示分级和教师反馈。
- 班级管理、排行榜、课程版本管理和内容编辑发布流。
- Connected E2E 的真实 Staging Supabase 凭据与部署烟测。

更多文件职责与扩展方法见 [ARCHITECTURE.md](./ARCHITECTURE.md)。
