import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--rs)] border border-transparent text-[13.5px] font-semibold whitespace-nowrap transition-all outline-none select-none active:not-aria-[haspopup]:translate-y-px disabled:opacity-55 disabled:pointer-events-none aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-gradient text-white shadow-brand-glow hover:opacity-90 focus-visible:ring-focus-glow focus-visible:border-[var(--g2)]",
        outline:
          "border-[var(--bdS)] bg-transparent text-[var(--tx)] hover:bg-[var(--surf2)] focus-visible:border-[var(--g2)] focus-visible:ring-focus-glow",
        secondary:
          "bg-[var(--surf2)] text-[var(--tx)] border-[var(--bdS)] hover:bg-[color-mix(in_oklab,var(--surf2),var(--tx)_8%)] focus-visible:border-[var(--g2)] focus-visible:ring-focus-glow",
        ghost:
          "text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf2)] focus-visible:border-[var(--g2)] focus-visible:ring-focus-glow",
        destructive:
          "text-[var(--bad)] border-[var(--bad)] bg-transparent hover:bg-[color-mix(in_oklab,var(--bad)_14%,transparent)] focus-visible:border-[var(--bad)] focus-visible:ring-[color-mix(in_oklab,var(--bad)_22%,transparent)]",
        link: "text-[var(--acc)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--rs),10px)] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--rs),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--rs),10px)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--rs),12px)]",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
