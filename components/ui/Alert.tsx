"use client";

import type { ReactNode } from "react";

type AlertVariant = "info" | "warning" | "error" | "success";

type AlertProps = {
  children: ReactNode;
  variant?: AlertVariant;
};

const baseClasses =
  "rounded-lg border px-3 py-2 text-xs md:text-sm shadow-sm";

const variants: Record<AlertVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function Alert({ children, variant = "info" }: AlertProps) {
  const variantClasses = variants[variant];
  return <div className={`${baseClasses} ${variantClasses}`}>{children}</div>;
}
