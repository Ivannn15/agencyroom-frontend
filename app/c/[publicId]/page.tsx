import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type PublicReport = {
  id: string;
  period: string;
  summary: string;
  spend?: number | null;
  revenue?: number | null;
  leads?: number | null;
  cpa?: number | null;
  roas?: number | null;
  whatWasDone?: string[] | null;
  nextPlan?: string[] | null;
  project?: {
    name?: string | null;
    client?: {
      name?: string | null;
      company?: string | null;
    } | null;
  } | null;
  publishedAt?: string | null;
  publicId?: string;
};

async function fetchPublicReport(publicId: string): Promise<PublicReport | null> {
  const res = await fetch(`${API_URL}/public/reports/${publicId}`, { cache: "no-store" });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function PublicReportPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const report = await fetchPublicReport(publicId);
  if (!report) {
    notFound();
  }

  const metrics: Array<[string, number | null | undefined]> = [
    ["Spend", report.spend],
    ["Revenue", report.revenue],
    ["Leads", report.leads],
    ["CPA", report.cpa],
    ["ROAS", report.roas]
  ].filter(([, value]) => value !== null && value !== undefined);

  const clientName = report.project?.client?.company || report.project?.client?.name || "Клиент";
  const projectName = report.project?.name || "Проект";
  const publishedAt = report.publishedAt ? new Date(report.publishedAt).toLocaleString("ru-RU") : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Публичный отчет</div>
          <h1 className="text-2xl font-semibold text-slate-900">{projectName}</h1>
          <p className="text-sm text-slate-600">Клиент: {clientName}</p>
          <p className="text-sm text-slate-600">Период: {report.period}</p>
          {publishedAt && <p className="text-xs text-slate-500">Опубликован: {publishedAt}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-slate-500 mb-1">{label}</div>
              <div className="text-xl font-semibold text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Резюме</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">{report.summary || "—"}</p>
        </div>

        {report.whatWasDone && report.whatWasDone.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Что сделано</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
              {report.whatWasDone.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        )}

        {report.nextPlan && report.nextPlan.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">План</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
              {report.nextPlan.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
