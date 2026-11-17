import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getCourse, getModule, getScenario } from "@/content/courses";

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
  const course = getCourse(courseId);
  const learningModule = getModule(courseId, moduleId);
  const scenario = getScenario(courseId, moduleId, scenarioId);

  if (!course || !learningModule || !scenario) notFound();

  return (
    <WorkspaceShell
      course={course}
      module={learningModule}
      scenario={scenario}
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
