import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import {
  getServerCourse,
  getServerModule,
  getServerScenario,
  toConnectedClientScenario,
} from "@/content/server-catalog";

type WorkspacePageProps = {
  params: Promise<{
    courseId: string;
    moduleId: string;
    scenarioId: string;
  }>;
};

export const metadata: Metadata = { title: "学习工作台" };

export default function WorkspacePage({ params }: WorkspacePageProps) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <ResolvedWorkspace params={params} />
    </Suspense>
  );
}

async function ResolvedWorkspace({ params }: WorkspacePageProps) {
  const { courseId, moduleId, scenarioId } = await params;
  const course = getServerCourse(courseId);
  const learningModule = getServerModule(courseId, moduleId);
  const fullScenario = getServerScenario(courseId, moduleId, scenarioId);

  if (!course || !learningModule || !fullScenario) notFound();
  const mode = process.env.RUN_MODE === "connected" ? "connected" : "demo";
  const scenario =
    mode === "connected"
      ? toConnectedClientScenario(fullScenario)
      : fullScenario;

  return (
    <WorkspaceShell
      course={course}
      module={learningModule}
      scenario={scenario}
      mode={mode}
    />
  );
}

function WorkspacePageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f4f6ef] p-5">
      <div className="mx-auto max-w-[1600px]">
        <div className="h-16 rounded-2xl bg-white" />
        <div className="mt-4 grid min-h-[75vh] gap-4 lg:grid-cols-[220px_1fr_310px]">
          <div className="rounded-2xl bg-white" />
          <div className="rounded-2xl bg-white" />
          <div className="rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
