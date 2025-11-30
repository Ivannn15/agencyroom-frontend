"use client";

import { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "muted";
};

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    muted: "bg-slate-50 text-slate-500 border border-slate-200"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
