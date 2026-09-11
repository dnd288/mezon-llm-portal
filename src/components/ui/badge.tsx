import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[var(--surf2)] text-[var(--tx)] border-[var(--bd)]",
        secondary:
          "bg-[var(--surf2)] text-[var(--mut)] border-[var(--bd)]",
        active:
          "bg-ok-tint text-[var(--ok)] border border-ok-tint",
        expired:
          "bg-warn-tint text-[var(--warn)] border border-warn-tint",
        revoked:
          "bg-bad-tint text-[var(--bad)] border border-bad-tint",
        brand:
          "bg-brand-gradient text-white border-transparent",
        destructive:
          "bg-bad-tint text-[var(--bad)] border border-bad-tint",
        outline:
          "border-[var(--bdS)] bg-transparent text-[var(--tx)]",
        ghost:
          "text-[var(--mut)] hover:bg-[var(--surf2)] hover:text-[var(--tx)]",
        link: "text-[var(--acc)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
