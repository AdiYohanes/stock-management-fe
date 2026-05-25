"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "warning" | "info";

interface FormAlertProps {
  variant: AlertVariant;
  message: string;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { icon: React.ElementType; containerClass: string; iconClass: string }
> = {
  error: {
    icon: XCircle,
    containerClass: "bg-red-50 border-red-200 text-red-800",
    iconClass: "text-red-500",
  },
  success: {
    icon: CheckCircle2,
    containerClass: "bg-green-50 border-green-200 text-green-800",
    iconClass: "text-green-500",
  },
  warning: {
    icon: AlertCircle,
    containerClass: "bg-yellow-50 border-yellow-200 text-yellow-800",
    iconClass: "text-yellow-500",
  },
  info: {
    icon: Info,
    containerClass: "bg-blue-50 border-blue-200 text-blue-800",
    iconClass: "text-blue-500",
  },
};

/**
 * Reusable alert component for form-level error/success messages.
 * Supports error, success, warning, and info variants.
 */
export function FormAlert({ variant, message, className }: FormAlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-center gap-3 rounded-md border px-4 py-3 text-sm",
        config.containerClass,
        className
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", config.iconClass)} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
