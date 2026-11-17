export type Locale = "zh" | "en";

export const uiCopy = {
  zh: {
    nav: {
      home: "首页",
      courses: "课程",
      records: "学习记录",
      content: "内容配置",
      settings: "设置",
      openWorkspace: "进入工作台",
    },
    common: {
      start: "开始",
      continue: "继续",
      save: "保存",
      saved: "已保存",
      cancel: "取消",
      reset: "重新开始",
      preview: "预览",
      editor: "编辑",
      demo: "演示",
      placeholder: "配置占位",
      pending: "待接入",
      completed: "已完成",
      inProgress: "进行中",
      notStarted: "未开始",
      minutes: "分钟",
      actions: "项操作",
    },
    workspace: {
      back: "返回课程",
      saving: "正在保存…",
      localSaved: "已保存到本机",
      progress: "任务进度",
      tools: "工具",
      task: "任务说明",
      conditions: "完成条件",
      hints: "提示",
      feedback: "最近反馈",
      activity: "活动记录",
      report: "查看报告",
      resetTitle: "重新开始演示？",
      resetBody: "当前运行会保留在学习记录中，新的运行会使用独立的开始时间和状态。",
      emptyFeedback: "完成一个操作后，这里会显示系统反馈。",
    },
    settings: {
      title: "设置",
      subtitle: "首版偏好保存在当前浏览器，不涉及账号同步。",
      language: "界面语言",
      theme: "视觉主题",
      light: "浅色",
      focus: "深绿聚焦",
      instruction: "摘要自定义指令",
      instructionHelp: "该字段为后续服务端摘要任务预留，不会在 Demo 中调用模型。",
      save: "保存设置",
      saved: "设置已保存",
    },
  },
  en: {
    nav: {
      home: "Home",
      courses: "Courses",
      records: "Records",
      content: "Content",
      settings: "Settings",
      openWorkspace: "Open workspace",
    },
    common: {
      start: "Start",
      continue: "Continue",
      save: "Save",
      saved: "Saved",
      cancel: "Cancel",
      reset: "Restart",
      preview: "Preview",
      editor: "Edit",
      demo: "Demo",
      placeholder: "Placeholder",
      pending: "Pending",
      completed: "Completed",
      inProgress: "In progress",
      notStarted: "Not started",
      minutes: "min",
      actions: "actions",
    },
    workspace: {
      back: "Back to courses",
      saving: "Saving…",
      localSaved: "Saved locally",
      progress: "Task progress",
      tools: "Tools",
      task: "Task brief",
      conditions: "Completion conditions",
      hints: "Hints",
      feedback: "Latest feedback",
      activity: "Activity log",
      report: "View report",
      resetTitle: "Restart the demo?",
      resetBody: "The current run stays in Learning records. A new run gets a separate start time and state.",
      emptyFeedback: "System feedback appears here after your first action.",
    },
    settings: {
      title: "Settings",
      subtitle: "First-version preferences stay in this browser and are not account-synced.",
      language: "Interface language",
      theme: "Visual theme",
      light: "Light",
      focus: "Forest focus",
      instruction: "Custom summary instruction",
      instructionHelp: "Reserved for a future server-side summary task. The demo does not call a model.",
      save: "Save settings",
      saved: "Settings saved",
    },
  },
} as const;

export function text(value: { zh: string; en: string }, locale: Locale): string {
  return value[locale];
}

export const toolLabels: Record<
  | "task"
  | "messages"
  | "notes"
  | "files"
  | "assistant"
  | "tests"
  | "version"
  | "release"
  | "summary",
  { zh: string; en: string }
> = {
  task: { zh: "任务中心", en: "Task center" },
  messages: { zh: "消息中心", en: "Messages" },
  notes: { zh: "项目说明", en: "Project notes" },
  files: { zh: "文件与差异", en: "Files & diff" },
  assistant: { zh: "AI 助手", en: "AI assistant" },
  tests: { zh: "测试与预览", en: "Tests & preview" },
  version: { zh: "版本协作", en: "Version control" },
  release: { zh: "发布", en: "Release" },
  summary: { zh: "文档摘要", en: "Document summary" },
};
