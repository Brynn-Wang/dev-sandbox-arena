import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ReportView } from "@/components/report-view";
import { publicCourses } from "@/content/server-catalog";

export const metadata: Metadata = {
  title: "学习报告",
};

export default function ReportPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 lg:px-8 lg:py-14">
        <Suspense fallback={<ReportPageSkeleton />}>
          <ResolvedReport params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function ResolvedReport({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  return <ReportView runId={runId} courses={publicCourses} />;
}

function ReportPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-32 rounded bg-[#dfe7dc]" />
      <div className="mt-5 h-56 rounded-[1.8rem] bg-[#dfe7dc]" />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="h-80 rounded-2xl bg-white" />
        <div className="h-80 rounded-2xl bg-white" />
      </div>
    </div>
  );
}
