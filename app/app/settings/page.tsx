"use client";

import { FormEvent, useState } from "react";

type AgencySettings = {
  agencyName: string;
  contactEmail: string;
  defaultCurrency: "RUB" | "USD" | "EUR";
  timezone: string;
};

type NotificationSettings = {
  notifyByEmail: boolean;
  weeklyDigest: boolean;
};

const currencyOptions: AgencySettings["defaultCurrency"][] = [
  "RUB",
  "USD",
  "EUR",
];

const timezoneOptions: string[] = [
  "UTC+03:00",
  "UTC+07:00",
  "UTC+00:00",
];

export default function SettingsPage() {
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    agencyName: "AgencyRoom Demo",
    contactEmail: "demo@agency.com",
    defaultCurrency: "RUB",
    timezone: "UTC+03:00",
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      notifyByEmail: false,
      weeklyDigest: false,
    });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveMessage("");

    if (!agencySettings.agencyName || !agencySettings.contactEmail) {
      setError("Укажите название агентства и email");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Сохранено");
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Настройки</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Профиль агентства
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Название агентства
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={agencySettings.agencyName}
              onChange={(e) =>
                setAgencySettings((prev) => ({
                  ...prev,
                  agencyName: e.target.value,
                }))
              }
              placeholder="AgencyRoom Demo"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email для уведомлений
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={agencySettings.contactEmail}
              onChange={(e) =>
                setAgencySettings((prev) => ({
                  ...prev,
                  contactEmail: e.target.value,
                }))
              }
              placeholder="demo@agency.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Валюта по умолчанию
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              value={agencySettings.defaultCurrency}
              onChange={(e) =>
                setAgencySettings((prev) => ({
                  ...prev,
                  defaultCurrency: e.target.value as AgencySettings["defaultCurrency"],
                }))
              }
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Часовой пояс
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              value={agencySettings.timezone}
              onChange={(e) =>
                setAgencySettings((prev) => ({
                  ...prev,
                  timezone: e.target.value,
                }))
              }
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Уведомления</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              checked={notificationSettings.notifyByEmail}
              onChange={(e) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  notifyByEmail: e.target.checked,
                }))
              }
            />
            <span>Отправлять отчеты на email</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              checked={notificationSettings.weeklyDigest}
              onChange={(e) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  weeklyDigest: e.target.checked,
                }))
              }
            />
            <span>Еженедельный дайджест по клиентам</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center rounded-lg bg-sky-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-sky-700 disabled:opacity-60"
        >
          {isSaving ? "Сохранение…" : "Сохранить изменения"}
        </button>
        {error && <div className="text-xs text-red-600">{error}</div>}
        {saveMessage && (
          <div className="text-xs text-emerald-600">{saveMessage}</div>
        )}
      </div>
    </form>
  );
}
