"use client";

import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center flex flex-col items-center gap-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
        <span className="text-lg">✨</span>
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

