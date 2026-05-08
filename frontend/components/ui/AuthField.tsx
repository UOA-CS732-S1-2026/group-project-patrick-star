"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./cn";

type CommonProps = {
  label: string;
  helperText?: string;
  errorText?: string;
  trailing?: ReactNode;
  multiline?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  controlClassName?: string;
};

type AuthFieldProps = CommonProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "children"> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children">;

export function AuthField({
  label,
  helperText,
  errorText,
  trailing,
  multiline = false,
  wrapperClassName,
  labelClassName,
  controlClassName,
  id,
  className,
  ...props
}: AuthFieldProps) {
  const controlClasses = cn(
    "block w-full rounded-[10px] border border-[#dddddd] bg-white px-4 py-2 text-[14px] text-[#202020] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-[#a8a8a8] focus:border-[#3b9bff] focus:ring-2 focus:ring-[#3b9bff]/20",
    Boolean(trailing) && "pr-12",
    errorText && "border-[#f0b8b2] focus:border-[#f06a5f] focus:ring-[#f06a5f]/15",
    multiline ? "min-h-[76px] resize-none leading-6" : "h-9",
    controlClassName
  );

  return (
    <label className={cn("block", wrapperClassName)} htmlFor={id}>
      <span
        className={cn(
          "mb-1 block text-[13px] font-semibold leading-none text-[#1f1f1f]",
          labelClassName
        )}
      >
        {label}
      </span>
      <div className="relative">
        {multiline ? (
          <textarea
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            id={id}
            className={cn(controlClasses, className)}
          />
        ) : (
          <input
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
            id={id}
            className={cn(controlClasses, className)}
          />
        )}
        {trailing ? (
          <div className="absolute inset-y-0 right-3 flex items-center text-[#8c8c8c]">
            {trailing}
          </div>
        ) : null}
      </div>
      {errorText ? (
        <p className="mt-1 text-[11px] leading-none text-[#ff645a]">
          {errorText}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] leading-none text-[#7e7e7e]">
          {helperText}
        </p>
      ) : null}
    </label>
  );
}
