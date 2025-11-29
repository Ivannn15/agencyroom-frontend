import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60 transition-all duration-150";

    const variantClasses =
      variant === "outline"
        ? "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
        : "bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:shadow-md active:translate-y-[1px]";

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
