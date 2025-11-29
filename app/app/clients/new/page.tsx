"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardContent } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Button } from "../../../../components/ui/Button";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email) {
      setError("Укажите имя клиента и email");
      return;
    }

    console.log("Create client", { name, company, email });
    router.push("/app/clients");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Новый клиент</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Данные клиента</CardTitle>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Имя клиента
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Анна"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Компания
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Store"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
              />
            </div>

            <div className="space-y-2">
              <Button type="submit" variant="primary">
                Сохранить клиента
              </Button>
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
