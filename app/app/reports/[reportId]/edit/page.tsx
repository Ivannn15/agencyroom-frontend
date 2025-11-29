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
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Редактировать отчет
      </h1>

      <ReportEditForm report={report} updateReport={updateReportAction} />
    </div>
  );
}
