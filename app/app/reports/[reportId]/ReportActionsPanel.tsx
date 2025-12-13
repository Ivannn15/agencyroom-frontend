"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { useAdminAuth } from "../../../../components/admin/AdminAuthProvider";
import { exportReport, publishReport, unpublishReport } from "../../../../lib/admin-api";

export default function ReportActionsPanel({
  reportId,
  status,
  publishedAt
}: {
  reportId: string;
  status: "draft" | "published";
  publishedAt: string | null;
}) {
  const { token } = useAdminAuth();
  const [currentStatus, setCurrentStatus] = useState<"draft" | "published">(status);
  const [currentPublishedAt, setCurrentPublishedAt] = useState<string | null>(publishedAt);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePublishToggle = async () => {
    if (!token) {
      setMessage("Нет токена авторизации");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      if (currentStatus === "draft") {
        const res = await publishReport(token, reportId);
        setCurrentStatus("published");
        setCurrentPublishedAt(res.publishedAt ?? null);
        setMessage("Отчет отправлен клиенту. Он появился в клиентском кабинете.");
      } else {
        await unpublishReport(token, reportId);
        setCurrentStatus("draft");
        setCurrentPublishedAt(null);
        setMessage("Отчет снят с публикации и скрыт из клиентского кабинета.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Не удалось выполнить действие. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!token) {
      setMessage("Нет токена авторизации");
      return;
    }
    setLoading(true);
    try {
      const res = await exportReport(token, reportId, format);
      setMessage(`Файл ${res.filename} скачан.`);
    } catch (err) {
      console.error(err);
      setMessage("Не удалось выполнить экспорт.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 text-right">
      <div className="flex flex-wrap gap-2 justify-end">
        <Badge variant={currentStatus === "published" ? "success" : "muted"}>
          {currentStatus === "published" ? "Отправлен клиенту" : "Черновик"}
        </Badge>
        {currentPublishedAt && (
          <Badge variant="muted">
            Опубликован: {new Date(currentPublishedAt).toLocaleString("ru-RU")}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          onClick={handlePublishToggle}
          disabled={loading}
          variant={currentStatus === "published" ? "outline" : "primary"}
        >
          {currentStatus === "published" ? "Снять с публикации" : "Отправить клиенту"}
        </Button>
        <Button variant="outline" onClick={() => handleExport("pdf")} disabled={loading}>
          Скачать PDF
        </Button>
        <Button variant="outline" onClick={() => handleExport("docx")} disabled={loading}>
          Скачать Word
        </Button>
      </div>
      {message && <div className="text-xs text-slate-600">{message}</div>}
      <div className="text-[11px] text-slate-500">Клиент видит только опубликованные отчеты в своем кабинете.</div>
    </div>
  );
}
