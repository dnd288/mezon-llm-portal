import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-[var(--rs)] border border-[var(--bdS)] bg-[var(--bg)] px-2.5 py-1 text-base text-[var(--tx)] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--tx)] placeholder:text-[var(--mut)] focus-visible:border-[var(--g2)] focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.22)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[var(--bad)] aria-invalid:shadow-[0_0_0_3px_rgba(255,107,107,0.20)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
