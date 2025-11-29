"use client";

import { startTransition } from "react";

export default function DeleteReportButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Точно удалить отчет?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={() => startTransition(action)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="inline-flex items-center text-xs text-red-600 hover:text-red-700"
      >
        Удалить отчет
      </button>
    </form>
  );
}
