"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function CustomToaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, className, ...props }) => (
        <Toast
          key={id}
          {...props}
          className={`${className || ""} ${className === "welcome-toast" ? "welcome-toast-styles" : ""}`}
        >
          <div className="grid gap-1">
            {title && (
              <ToastTitle className={className === "welcome-toast" ? "text-emerald-300" : ""}>{title}</ToastTitle>
            )}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className="welcome-toast-viewport" />
    </ToastProvider>
  )
}

