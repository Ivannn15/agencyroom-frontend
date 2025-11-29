"use client";

import { useTransition } from "react";

export default function DeleteClientButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Удалить клиента? Сначала убедитесь, что у него нет проектов.")) {
      event.preventDefault();
      return;
    }

    startTransition(() => {});
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center text-xs text-red-600 hover:text-red-700"
      >
        {isPending ? "Удаляем..." : "Удалить клиента"}
      </button>
    </form>
  );
}
