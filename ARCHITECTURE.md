# 架构说明

## 运行模式

- `demo`：完整状态在浏览器 reducer 中推进，快照写入 localStorage。
- `connected`：浏览器只提交客户端 Action；服务端验证会话、计算下一页状态并写入 Supabase。
- 两种模式共用 `SimulationState`、reducer、选择器和学习报告。

入口由服务端页面读取 `RUN_MODE`。Connected 页面使用脱敏 Scenario；完整 `content/courses.ts` 只由 `server-only` 模块读取。

## 四层边界

### 1. 页面与共享组件

- `app/`：App Router 页面与 `/api/assistant` Route Handler。
- `components/`：站点导航、课程卡片、学习记录、报告、设置和课程预览。
- `components/workspace/`：三栏工作台、任务侧栏与共享工具面板。

页面负责路由、读取静态课程配置和组合布局。Demo 工作台通过 Client Component 访问浏览器状态；Connected 工作台只通过受保护 Run API 读取和提交状态。

### 2. 课程内容配置

- `content/types.ts`：Zod Schema 与 `Course`、`Module`、`Scenario`、`Task`、`ToolId` 等类型。
- `content/courses.ts`：课程、模块、工具范围、任务步骤、初始文件、消息、完成条件和反馈占位。
- `content/ui.ts`：中文／英文共享界面文案。

新增实验时优先新增 `courses.ts` 中的模块或场景。只要活动可映射到现有工具，就不需要给每门实验复制一套页面。

### 3. 模拟状态与规则

- `lib/simulation/types.ts`：`SimulationState`、`Action`、`Event`、`RunRecord` 等核心类型。
- `lib/simulation/reducer.ts`：唯一状态转换函数，包含前置条件与事件记录。
- `lib/simulation/selectors.ts`：步骤完成度、阶段、发布检查等派生状态。
- `lib/simulation/storage.ts`：localStorage 读写、运行记录去重和上限。
- `lib/simulation/run-context.tsx`：客户端状态 Provider、刷新恢复和重新开始。
- `lib/simulation/run-store.ts`：`LocalRunStore` 与 `ConnectedRunStore` 的统一接口。
- `lib/simulation/actions.ts`：浏览器可提交 Action 的 Zod 白名单，禁止注入服务端 AI 结果。

按钮不保存自己的完成状态。任务勾选、发布条件、PR 状态和报告内容都从 `SimulationState` 派生。

### 4. 服务端数据与 AI

- `lib/supabase/`：浏览器、会话感知服务端和 service-role 客户端。
- `lib/server/runs.ts`：服务端运行读取、启动、乐观锁写入、重置和历史查询。
- `app/api/runs/`：Connected Run API 与记录读取 API。
- `lib/ai/evaluate-assistant.ts`：结构化模型评估与关键词降级。
- `supabase/migrations/`：Profile、Run、Event、RLS 和原子 transition 函数。

Connected 写入使用独占的 service role，但必须先通过用户会话验证，再由 API 调用 reducer 计算状态。浏览器不持有 service role key。

## 修改入口

| 需求 | 修改位置 |
| --- | --- |
| 增加课程 / 模块 | `content/courses.ts` |
| 增加工具类型 | `content/types.ts` 的 `TOOL_IDS`，再补工具面板与配置 |
| 改任务步骤 | 对应 Scenario 的 `taskSteps` |
| 改完成判断 | `lib/simulation/selectors.ts` |
| 改前置条件或事件 | `lib/simulation/reducer.ts` |
| 改工作台布局 | `components/workspace/workspace-shell.tsx` |
| 改单个共享工具 | `components/workspace/tool-panels.tsx` |
| 改共享中文／英文文案 | `content/ui.ts` 或课程配置中的双语字段 |
| 改页面视觉基线 | `app/globals.css` |

## Demo 与 Connected

Demo 默认完全在浏览器运行：

- 确定性 AI 回复位于 `lib/ai/demo-adapter.ts`。
- 课程配置不包含密钥。
- 进度写入 `localStorage`。
- 文本中明确说明模拟不是真实部署、真实模型输出或安全认证。

Connected 方向：

1. 在服务端读取用户身份，并依据 Supabase RLS 访问学习记录、摘要与文件元数据。
2. PDF/TXT 原件进入 Supabase Storage；文件信息、提取文本和摘要进入 PostgreSQL。
3. 学习记录、标准答案和评分规则按用户或班级隔离。
4. 模型密钥只由 `lib/ai/server-adapter.ts` 和 Route Handler 读取。
5. 评分规则与标准答案不得作为公共课程配置直接发到浏览器。

Connected 模式已经实现登录、RLS、运行持久化、事件记录和健康检查。部署前仍需按 `docs/DEPLOYMENT.md` 为 Preview、Staging 和 Production 配置独立的 Supabase 项目。

## 持久化与重新开始

每次状态变化会更新活跃运行，并按 `runId` upsert 到最近 20 条运行记录中。重新开始调用 `resetSimulation()`：

- 新运行生成新的 `runId` 与开始时间。
- 邮件、笔记、文件、测试、Git、PR 和发布状态回到初始值。
- 旧运行的记录已经独立保存，不参与新运行的条件判断。

浏览器存储损坏、不可用或配额已满时，当前工作台仍可继续运行，但刷新恢复可能不可用。正式模式应改为服务端持久化。
