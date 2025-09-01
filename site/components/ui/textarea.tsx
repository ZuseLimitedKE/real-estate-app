import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Styled textarea wrapper that forwards native textarea props.
 *
 * Renders a native <textarea> with a consistent set of utility classes and a `data-slot="textarea"` attribute.
 * Any `className` passed in is merged with the component's default classes.
 *
 * @param className - Optional additional CSS classes to merge with the component's default styling.
 * @returns The rendered textarea element with all other props forwarded to the underlying element.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
