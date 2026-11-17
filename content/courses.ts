import { CourseConfigSchema, type Course, type Module, type Scenario } from "./types";

const tasks = {
  readEmail: {
    id: "read-email",
    title: { zh: "阅读任务邮件", en: "Read the task email" },
    description: {
      zh: "打开项目经理发来的发布前缺陷说明。",
      en: "Open the pre-release defect note from the project lead.",
    },
    toolId: "messages" as const,
  },
  saveNotes: {
    id: "save-notes",
    title: { zh: "保存项目需求", en: "Save project requirements" },
    description: {
      zh: "把当前缺陷、风险和验收条件整理到项目说明中。",
      en: "Capture the defect, risk and acceptance condition in the project note.",
    },
    toolId: "notes" as const,
  },
  requestEdit: {
    id: "request-edit",
    title: { zh: "请求演示助手修改", en: "Request an assistant edit" },
    description: {
      zh: "使用 Build 模式请求一个最小修复，并检查它造成的变化。",
      en: "Use Build mode to request a minimal fix and inspect the resulting change.",
    },
    toolId: "assistant" as const,
  },
  runTests: {
    id: "run-tests",
    title: { zh: "运行模拟测试", en: "Run simulated tests" },
    description: {
      zh: "先观察失败结果，再应用修复并重新验证。",
      en: "Observe the first failure, apply the fix, then verify again.",
    },
    toolId: "tests" as const,
  },
  deliver: {
    id: "deliver",
    title: { zh: "提交并打开 PR", en: "Commit and open a PR" },
    description: {
      zh: "依次暂存、提交、打开 PR 并完成审查。",
      en: "Stage, commit, open a PR and complete the review.",
    },
    toolId: "version" as const,
  },
  release: {
    id: "release",
    title: { zh: "发布到模拟正式环境", en: "Release to the simulated production" },
    description: {
      zh: "所有检查满足后，将构建发布到演示环境。",
      en: "Release the build once every check is satisfied.",
    },
    toolId: "release" as const,
  },
  report: {
    id: "report",
    title: { zh: "查看学习报告", en: "View the learning report" },
    description: {
      zh: "检查操作记录与演示反馈占位内容。",
      en: "Review the activity log and demo feedback placeholder.",
    },
    toolId: "task" as const,
  },
};

const sharedMessages = [
  {
    id: "release-brief",
    from: "林悦 · 产品负责人",
    subject: {
      zh: "发布前缺陷：新笔记出现删除按钮",
      en: "Pre-release defect: delete action appears on a new note",
    },
    time: "09:24",
    required: true,
    body: {
      zh: "请修复新笔记尚未保存时仍显示删除按钮的问题。验收条件：新笔记不显示删除按钮；已保存笔记保持可用；回归测试必须通过。修改需经过 PR 审查后才能发布。",
      en: "Fix the delete action that still appears before a new note is saved. Acceptance: hide it for new notes, keep it for saved notes, and pass regression tests. Changes must pass PR review before release.",
    },
  },
  {
    id: "design-note",
    from: "周言 · 设计搭档",
    subject: {
      zh: "补充：保持操作栏紧凑",
      en: "Note: keep the action bar compact",
    },
    time: "08:50",
    required: false,
    body: {
      zh: "修复时不要新增第二个操作栏。按钮出现或隐藏时，布局不应明显跳动。",
      en: "Do not add a second action bar. The layout should not jump when the button appears or disappears.",
    },
  },
];

const noteEditorInitial = `export function NoteEditor({ noteId }: NoteEditorProps) {
  return (
    <div className="actions">
      <button>保存</button>
      <button>删除</button>
    </div>
  );
}`;

const noteEditorAiAttempt = `export function NoteEditor({ noteId }: NoteEditorProps) {
  return (
    <div className="actions">
      <button>保存</button>
      {noteId ? <button>删除</button> : null}
    </div>
  );
}`;

const noteEditorFixed = `export function NoteEditor({ isSaved }: NoteEditorProps) {
  return (
    <div className="actions">
      <button>保存</button>
      {isSaved ? <button>删除</button> : null}
    </div>
  );
}`;

const projectBrief = `# 发布前修复

- 新笔记尚未保存时隐藏删除按钮
- 已保存笔记的删除入口保持可用
- 不增加新的布局层级
- 自动测试通过后才能提交和发布
`;

export const courses: Course[] = CourseConfigSchema.parse([
  {
    id: "ai-software-engineering",
    slug: "ai-software-engineering",
    title: {
      zh: "AI 辅助软件工程",
      en: "AI-assisted software engineering",
    },
    description: {
      zh: "从需求澄清到测试、审查和发布，练习可验证的开发决策。",
      en: "Practice verifiable development decisions from requirement discovery to release.",
    },
    level: { zh: "入门到进阶", en: "Starter to advanced" },
    accent: "mint",
    modules: [
      {
        id: "release-defect",
        slug: "release-defect",
        title: {
          zh: "需求到发布：修复一个真实缺陷",
          en: "Requirements to release: fix a real defect",
        },
        summary: {
          zh: "完整走通演示流程：邮件、需求、AI 修改、差异、失败测试、修复、PR 和发布。",
          en: "Walk through email, requirements, an AI edit, diff, failed test, fix, PR and release.",
        },
        stage: { zh: "综合工作流", en: "Integrated workflow" },
        estimatedMinutes: 15,
        readiness: "ready",
        scenarios: [
          {
            id: "guided-demo",
            title: {
              zh: "演示：从缺陷说明到正式发布",
              en: "Demo: from defect brief to production",
            },
            summary: {
              zh: "一个短任务，验证所有共享工具与状态前置条件。",
              en: "A short task that validates the shared tools and state guards.",
            },
            brief: {
              zh: "你是本次发布的值班开发者。先确认需求，再让演示助手准备修改；不要跳过失败测试和 PR 审查。",
              en: "You are the release-duty developer. Confirm the requirement, prepare an assistant edit, and do not skip the failed test or PR review.",
            },
            stageLabel: { zh: "演示模块", en: "Demo module" },
            estimatedMinutes: 15,
            isDemo: true,
            enabledTools: [
              "task",
              "messages",
              "notes",
              "files",
              "assistant",
              "tests",
              "version",
              "release",
            ],
            taskSteps: [
              tasks.readEmail,
              tasks.saveNotes,
              tasks.requestEdit,
              tasks.runTests,
              tasks.deliver,
              tasks.release,
              tasks.report,
            ],
            initialFiles: [
              {
                path: "components/NoteEditor.tsx",
                name: "NoteEditor.tsx",
                language: "TypeScript React",
                initialContent: noteEditorInitial,
                aiContent: noteEditorAiAttempt,
                fixedContent: noteEditorFixed,
              },
              {
                path: "docs/project-brief.md",
                name: "project-brief.md",
                language: "Markdown",
                initialContent: projectBrief,
                aiContent: `${projectBrief}\n- AI 建议：先添加最小条件分支\n`,
                fixedContent: projectBrief,
              },
            ],
            messages: sharedMessages,
            completionConditions: [
              {
                id: "email-read",
                label: { zh: "任务邮件已读", en: "Task email read" },
                description: {
                  zh: "邮件中心中的任务邮件被标记为已读。",
                  en: "The task email is marked as read in the inbox.",
                },
              },
              {
                id: "requirements-saved",
                label: { zh: "需求已保存", en: "Requirements saved" },
                description: {
                  zh: "项目说明保存了非空内容。",
                  en: "The project note contains saved content.",
                },
              },
              {
                id: "tests-pass",
                label: { zh: "回归测试通过", en: "Regression tests pass" },
                description: {
                  zh: "模拟测试处于通过状态。",
                  en: "The simulated test suite is passing.",
                },
              },
              {
                id: "pr-approved",
                label: { zh: "PR 已审查", en: "PR reviewed" },
                description: {
                  zh: "版本协作区的 PR 已批准。",
                  en: "The pull request is approved in the version workspace.",
                },
              },
              {
                id: "released",
                label: { zh: "已发布", en: "Released" },
                description: {
                  zh: "构建发布到模拟正式环境。",
                  en: "The build is released to the simulated production environment.",
                },
              },
            ],
            feedbackPlaceholder: {
              zh: "演示评价占位：后续可由规则引擎或教师配置反馈。本版仅展示操作事实，不生成 AI 分数。",
              en: "Demo feedback placeholder: later versions may use rules or instructor feedback. This version shows facts, not an AI score.",
            },
          },
        ],
      },
      {
        id: "quiz-foundations",
        slug: "quiz-foundations",
        title: {
          zh: "主题练习：软件工程基础",
          en: "Topic drills: software engineering foundations",
        },
        summary: {
          zh: "预留 Git、敏捷、DevOps、Docker 与系统设计的选择题和能力标签。",
          en: "Reserved drills and skill tags for Git, Agile, DevOps, Docker and system design.",
        },
        stage: { zh: "知识练习", en: "Knowledge drills" },
        estimatedMinutes: 12,
        readiness: "placeholder",
        scenarios: [
          {
            id: "foundations-preview",
            title: {
              zh: "主题练习配置占位",
              en: "Topic drill configuration placeholder",
            },
            summary: {
              zh: "练习题型、题目和评分规则将在后续配置。",
              en: "Question types, prompts and scoring will be configured later.",
            },
            brief: {
              zh: "本模块用于验证练习入口和进度占位，不包含正式题库。",
              en: "This module validates the drill entry and progress placeholders; no live question bank is included.",
            },
            stageLabel: { zh: "内容待接入", en: "Content pending" },
            estimatedMinutes: 12,
            enabledTools: ["task", "notes"],
            taskSteps: [
              {
                id: "review-topics",
                title: { zh: "浏览主题范围", en: "Review topic scope" },
                description: {
                  zh: "查看未来将覆盖的软件工程主题。",
                  en: "Review the software engineering topics planned for this module.",
                },
                toolId: "task",
              },
            ],
            initialFiles: [],
            messages: [],
            completionConditions: [
              {
                id: "placeholder",
                label: { zh: "配置待接入", en: "Configuration pending" },
                description: {
                  zh: "正式内容接入后定义完成条件。",
                  en: "Completion conditions will be defined with the real content.",
                },
              },
            ],
            feedbackPlaceholder: {
              zh: "练习反馈与评分规则尚未配置。",
              en: "Drill feedback and scoring rules are not configured yet.",
            },
          },
        ],
      },
      {
        id: "portfolio-iteration",
        slug: "portfolio-iteration",
        title: {
          zh: "个人主页迭代实验",
          en: "Personal page iteration lab",
        },
        summary: {
          zh: "预留 Markdown 素材、响应式预览、迭代修改和 Ask／Plan／Agent 对比任务。",
          en: "Reserved task structure for Markdown source material, responsive preview, iteration and assistant modes.",
        },
        stage: { zh: "界面迭代", en: "Interface iteration" },
        estimatedMinutes: 20,
        readiness: "placeholder",
        scenarios: [
          {
            id: "portfolio-preview",
            title: { zh: "个人主页任务模板", en: "Personal page task template" },
            summary: {
              zh: "用于展示素材文件、预览和迭代工具如何共用。",
              en: "Shows how shared material, preview and iteration tools can be reused.",
            },
            brief: {
              zh: "正式任务内容后续通过课程配置补充。",
              en: "The full task will be added through course configuration later.",
            },
            stageLabel: { zh: "模板占位", en: "Template placeholder" },
            estimatedMinutes: 20,
            enabledTools: ["task", "notes", "files", "assistant", "tests"],
            taskSteps: [
              {
                id: "inspect-material",
                title: { zh: "检查素材结构", en: "Inspect source material" },
                description: {
                  zh: "预览 Markdown 素材和页面结构。",
                  en: "Preview the Markdown material and page structure.",
                },
                toolId: "files",
              },
            ],
            initialFiles: [],
            messages: [],
            completionConditions: [
              {
                id: "template-pending",
                label: { zh: "模板待配置", en: "Template pending" },
                description: {
                  zh: "接入正式素材后定义验收条件。",
                  en: "Acceptance conditions will be defined with the final material.",
                },
              },
            ],
            feedbackPlaceholder: {
              zh: "界面反馈占位，尚未接入评分。",
              en: "Interface feedback placeholder; scoring is not connected.",
            },
          },
        ],
      },
      {
        id: "translate-notes",
        slug: "translate-notes",
        title: {
          zh: "笔记翻译功能实验",
          en: "Note translation feature lab",
        },
        summary: {
          zh: "预留分支、Bug 修复、翻译功能、PR、测试与服务端模型接口任务。",
          en: "Reserved workflows for branching, bug fixes, translation, PR review, tests and server-side model calls.",
        },
        stage: { zh: "功能开发", en: "Feature development" },
        estimatedMinutes: 35,
        readiness: "placeholder",
        scenarios: [
          {
            id: "translation-preview",
            title: { zh: "翻译功能任务占位", en: "Translation feature placeholder" },
            summary: {
              zh: "未来复用助手、测试、版本与发布工具组成完整功能任务。",
              en: "Future tasks reuse assistant, tests, version and release tools.",
            },
            brief: {
              zh: "首版只保留工作流入口，不包含真实模型调用。",
              en: "The first version keeps the workflow entry only and makes no live model call.",
            },
            stageLabel: { zh: "功能待接入", en: "Feature pending" },
            estimatedMinutes: 35,
            enabledTools: ["task", "assistant", "tests", "version", "release"],
            taskSteps: [
              {
                id: "feature-brief",
                title: { zh: "阅读功能范围", en: "Review feature scope" },
                description: {
                  zh: "确认翻译功能与后续版本前置条件。",
                  en: "Review the translation scope and follow-up release guards.",
                },
                toolId: "task",
              },
            ],
            initialFiles: [],
            messages: [],
            completionConditions: [
              {
                id: "feature-pending",
                label: { zh: "功能任务待配置", en: "Feature task pending" },
                description: {
                  zh: "后续从课程配置增加具体文件和测试。",
                  en: "Files and tests will be added through course configuration.",
                },
              },
            ],
            feedbackPlaceholder: {
              zh: "功能开发评价占位。",
              en: "Feature development feedback placeholder.",
            },
          },
        ],
      },
    ],
  },
  {
    id: "document-intelligence",
    slug: "document-intelligence",
    title: {
      zh: "文档智能应用",
      en: "Document intelligence apps",
    },
    description: {
      zh: "用共享的摘要工作区验证文件、提取文本、Markdown 编辑和真实／模拟数据边界。",
      en: "Use a shared summary workspace to validate files, extracted text, Markdown editing and demo boundaries.",
    },
    level: { zh: "项目实践", en: "Project practice" },
    accent: "lime",
    modules: [
      {
        id: "summary-workspace",
        slug: "summary-workspace",
        title: { zh: "AI 摘要工作区", en: "AI summary workspace" },
        summary: {
          zh: "以明确标注的演示数据展示文件列表、原文、提取文本和可编辑摘要。",
          en: "A clearly labelled demo of file list, source, extracted text and editable summary.",
        },
        stage: { zh: "文档工作流", en: "Document workflow" },
        estimatedMinutes: 10,
        readiness: "ready",
        scenarios: [
          {
            id: "demo-summary",
            title: { zh: "演示：编辑文档摘要", en: "Demo: edit a document summary" },
            summary: {
              zh: "验证摘要编辑、预览和本地保存。文件上传、PDF 提取与真实 LLM 调用尚未接入。",
              en: "Validate summary editing, preview and local save. Upload, PDF extraction and live LLM calls are not connected.",
            },
            brief: {
              zh: "当前文件是演示记录，并非真实上传。编辑摘要后保存，刷新页面应恢复内容。",
              en: "The file is a demo record, not a real upload. Save an edit and refresh to verify persistence.",
            },
            stageLabel: { zh: "演示工作区", en: "Demo workspace" },
            estimatedMinutes: 10,
            enabledTools: ["task", "files", "summary"],
            taskSteps: [
              {
                id: "inspect-file",
                title: { zh: "检查演示文件", en: "Inspect the demo file" },
                description: {
                  zh: "确认文件列表和演示数据标记。",
                  en: "Confirm the file list and demo-data label.",
                },
                toolId: "files",
              },
              {
                id: "edit-summary",
                title: { zh: "编辑并保存摘要", en: "Edit and save the summary" },
                description: {
                  zh: "在摘要标签中修改 Markdown 并保存。",
                  en: "Edit Markdown in the summary tab and save it.",
                },
                toolId: "summary",
              },
            ],
            initialFiles: [],
            messages: [],
            completionConditions: [
              {
                id: "summary-saved",
                label: { zh: "摘要已保存", en: "Summary saved" },
                description: {
                  zh: "摘要内容保存到 Demo 运行记录。",
                  en: "The summary is saved in the demo run record.",
                },
              },
            ],
            feedbackPlaceholder: {
              zh: "当前为演示摘要，不是真实模型生成内容。",
              en: "This is a demo summary, not live model output.",
            },
            summaryDemo: {
              fileName: "版本控制演示笔记.pdf",
              fileType: "PDF",
              originalText:
                "演示原文：版本控制记录文件随时间的变化；提交表示一个可追踪的保存点；分支允许工作流彼此独立。",
              extractedText:
                "版本控制用于追踪文件变化。提交是可引用的状态快照。分支让实验性工作与主线隔离，并通过合并或审查重新汇合。",
              initialSummary: `## 核心概念

- 版本控制保存可追踪的文件变化
- 提交是可引用的状态快照
- 分支用于隔离实验与主线工作

> 演示摘要：文件未上传，内容未经过真实 PDF 提取或模型生成。`,
              notice: {
                zh: "演示数据：未上传真实文件，也未调用 LLM。",
                en: "Demo data: no real file was uploaded and no LLM was called.",
              },
            },
          },
        ],
      },
      {
        id: "summary-production",
        slug: "summary-production",
        title: { zh: "摘要应用生产化", en: "Productionize the summary app" },
        summary: {
          zh: "预留 Supabase Storage、PostgreSQL、用户隔离、环境变量和 Vercel 发布任务。",
          en: "Reserved tasks for Supabase Storage, PostgreSQL, user isolation, environment variables and Vercel.",
        },
        stage: { zh: "部署与数据", en: "Deployment and data" },
        estimatedMinutes: 45,
        readiness: "placeholder",
        scenarios: [
          {
            id: "connected-preview",
            title: { zh: "Connected 模式占位", en: "Connected mode placeholder" },
            summary: {
              zh: "首版不包含正式认证、文件上传或数据库规则执行。",
              en: "The first version does not include live authentication, uploads or database policies.",
            },
            brief: {
              zh: "真实模式必须通过服务端和数据库规则隔离用户数据。",
              en: "Connected mode must isolate user data with server and database rules.",
            },
            stageLabel: { zh: "待接入", en: "Pending integration" },
            estimatedMinutes: 45,
            enabledTools: ["task", "release"],
            taskSteps: [
              {
                id: "connected-brief",
                title: { zh: "查看接入边界", en: "Review integration boundaries" },
                description: {
                  zh: "检查环境变量和服务端职责。",
                  en: "Review environment variables and server responsibilities.",
                },
                toolId: "task",
              },
            ],
            initialFiles: [],
            messages: [],
            completionConditions: [
              {
                id: "connected-pending",
                label: { zh: "服务待接入", en: "Services pending" },
                description: {
                  zh: "配置 Supabase 和模型服务后启用。",
                  en: "Enabled after Supabase and model services are configured.",
                },
              },
            ],
            feedbackPlaceholder: {
              zh: "Connected 模式评分与反馈待接入。",
              en: "Connected-mode scoring and feedback are pending.",
            },
          },
        ],
      },
    ],
  },
]);

export const demoCourse = courses[0];
export const demoModule = demoCourse.modules[0];
export const demoScenario = demoModule.scenarios[0];

export function getCourse(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId || course.slug === courseId);
}

export function getModule(courseId: string, moduleId: string): Module | undefined {
  return getCourse(courseId)?.modules.find(
    (module) => module.id === moduleId || module.slug === moduleId,
  );
}

export function getScenario(
  courseId: string,
  moduleId: string,
  scenarioId: string,
): Scenario | undefined {
  return getModule(courseId, moduleId)?.scenarios.find(
    (scenario) => scenario.id === scenarioId,
  );
}

export function workspaceHref(
  course: Course,
  module: Module,
  scenario: Scenario,
): string {
  return `/workspace/${course.slug}/${module.slug}/${scenario.id}`;
}

export const demoWorkspaceHref = workspaceHref(
  demoCourse,
  demoModule,
  demoScenario,
);
