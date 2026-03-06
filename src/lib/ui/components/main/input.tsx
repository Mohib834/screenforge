import * as React from "react";

import { cn } from "../../../utils";

interface Props {
  helperText?: React.ReactNode;
  label?: string;
  error?: boolean;
  errorText?: string;
  prefixIcon?: React.ReactNode;
  onPrefixIconClick?: () => void;
  suffixIcon?: React.ReactNode;
  onSuffixIconClick?: () => void;
  disabled?: boolean;
  labelProps?: {
    className?: string;
  };
}

function Input({
  className,
  type,
  helperText,
  label,
  error,
  errorText,
  prefixIcon,
  onPrefixIconClick,
  suffixIcon,
  onSuffixIconClick,
  disabled,
  ...props
}: React.ComponentProps<"input"> & Props) {
  return (
    <div>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium mb-1 input-label"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          data-slot="input"
          aria-invalid={error}
          disabled={disabled}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-8 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            prefixIcon && suffixIcon
              ? "pl-10 pr-10"
              : prefixIcon
                ? "pl-10 pr-3"
                : suffixIcon
                  ? "pr-10 pl-3"
                  : "px-3",
            error &&
            "border-destructive ring-destructive/20 dark:ring-destructive/40",
            className
          )}
          {...props}
        />

        {prefixIcon && (
          <div
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              onPrefixIconClick ? "cursor-pointer" : "pointer-events-none"
            )}
            onClick={onPrefixIconClick}
          >
            {prefixIcon}
          </div>
        )}

        {suffixIcon && (
          <div
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              onSuffixIconClick ? "cursor-pointer" : "pointer-events-none"
            )}
            onClick={onSuffixIconClick}
          >
            {suffixIcon}
          </div>
        )}
      </div>

      {errorText && error && (
        <p className="mt-1 ml-1 text-sm text-destructive error-text">
          {errorText}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 ml-1 text-sm text-gray-600 helper-text">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
