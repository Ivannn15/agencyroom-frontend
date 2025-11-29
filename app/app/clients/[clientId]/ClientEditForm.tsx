"use client";

import { useTransition } from "react";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

type ClientEditFormProps = {
  client: {
    id: string;
    name: string;
    company: string | null;
    contactEmail: string;
  };
  updateClient: (formData: FormData) => Promise<void>;
};

export default function ClientEditForm({ client, updateClient }: ClientEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(() => updateClient(formData));
  };

  return (
    <form action={handleAction} className="space-y-4">
      <div className="grid gap-4 max-w-md">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Имя контакта
          </label>
          <Input name="name" defaultValue={client.name} required />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Компания
          </label>
          <Input name="company" defaultValue={client.company ?? ""} />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email
          </label>
          <Input
            name="email"
            type="email"
            defaultValue={client.contactEmail}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Сохраняем..." : "Сохранить изменения"}
      </Button>
    </form>
  );
}
