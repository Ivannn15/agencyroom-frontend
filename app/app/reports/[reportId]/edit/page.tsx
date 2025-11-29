import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { updateReport } from "../actions";
import ReportEditForm from "../ReportEditForm";

type ReportEditPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportEditPage({ params }: ReportEditPageProps) {
  const { reportId } = await params;

  if (!reportId) {
    notFound();
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    notFound();
  }

  const updateReportAction = updateReport.bind(null, report.id);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          Редактирование отчета
        </h1>
        <p className="text-sm text-slate-500">
          Подкорректируйте результаты, резюме и план при необходимости.
        </p>
      </div>

      <ReportEditForm report={report} updateReport={updateReportAction} />
    </div>
  );
}
