import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    const baseClasses =
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white";

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
