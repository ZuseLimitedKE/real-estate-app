import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Render a styled textarea that forwards all native textarea props to the underlying element.
 *
 * @param className - Optional additional CSS class names to append to the component's default styles
 * @param props - Other standard textarea props which are spread onto the rendered <textarea>
 * @returns The rendered textarea element with default styling, merged className, and forwarded props
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
