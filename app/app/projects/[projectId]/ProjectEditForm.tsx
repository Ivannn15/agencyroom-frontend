"use client";

import { useTransition } from "react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

type ProjectEditFormProps = {
  project: {
    id: string;
    name: string;
    clientId: string;
    status: "active" | "paused" | "completed";
    notes: string | null;
  };
  clients: Array<{ id: string; name: string; company: string | null }>;
  updateProject: (formData: FormData) => Promise<void>;
};

export default function ProjectEditForm({
  project,
  clients,
  updateProject,
}: ProjectEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(() => updateProject(formData));
  };

  return (
    <form action={handleAction} className="space-y-6">
      <div className="grid gap-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Название проекта
          </label>
          <Input
            name="name"
            defaultValue={project.name}
            placeholder="Например, Контекстная реклама для ООО Ромашка"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Клиент проекта
          </label>
          <select
            name="clientId"
            defaultValue={project.clientId}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company ? `${c.company} · ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Статус
          </label>
          <select
            name="status"
            defaultValue={project.status}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="active">Активен</option>
            <option value="paused">Пауза</option>
            <option value="completed">Завершен</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Статус помогает ориентироваться в текущем состоянии проекта в списке.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Заметки
          </label>
          <textarea
            name="notes"
            defaultValue={project.notes ?? ""}
            placeholder="Краткий контекст по проекту, важные детали..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 min-h-[100px]"
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Сохраняем..." : "Сохранить изменения"}
      </Button>
    </form>
  );
}
