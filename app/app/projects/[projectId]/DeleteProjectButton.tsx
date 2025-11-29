"use client";

import { startTransition } from "react";

export default function DeleteProjectButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Удалить проект? Отчеты должны быть предварительно удалены.")) {
      e.preventDefault();
    }
  };

  return (
    <form action={() => startTransition(action)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="inline-flex items-center text-xs text-red-600 hover:text-red-700"
      >
        Удалить проект
      </button>
    </form>
  );
}
