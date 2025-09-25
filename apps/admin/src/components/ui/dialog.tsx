"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Wraps the Radix Dialog Root and attaches a data-slot attribute for consistent identification and styling.
 *
 * @returns A DialogPrimitive.Root element with `data-slot="dialog"` and all provided props forwarded.
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * Wraps the Radix Dialog Trigger element and attaches a `data-slot="dialog-trigger"` attribute.
 *
 * @returns A `DialogPrimitive.Trigger` element with `data-slot="dialog-trigger"` and all forwarded props
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * Renders a portal element for dialogs with a consistent data-slot attribute.
 *
 * @param props - Props forwarded to the underlying portal element
 * @returns A React element rendering a portal with `data-slot="dialog-portal"` and forwarded props
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * Renders a Radix Dialog Close component with a standardized data-slot attribute.
 *
 * @returns A `DialogPrimitive.Close` React element with `data-slot="dialog-close"` and any provided props forwarded.
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * Renders the dialog backdrop overlay with the component's default backdrop styling.
 *
 * @param className - Additional CSS classes to append to the overlay's default styles
 * @returns The dialog overlay element (`DialogPrimitive.Overlay`) with backdrop styling, a `data-slot="dialog-overlay"` attribute, and merged `className`
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders dialog content inside a portal with an overlay and an optional close button.
 *
 * The component composes a portal, overlay, and Radix Content element, applying layout and animation
 * classes and forwarding any additional props to the underlying Content primitive.
 *
 * @param showCloseButton - When `true` (default), a positioned close button is rendered inside the content.
 * @returns The dialog content element to be rendered in a portal.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * Renders a dialog header container with consistent vertical layout, gap, and responsive text alignment.
 *
 * @param className - Additional CSS classes appended to the default header styles
 * @returns A `div` element with `data-slot="dialog-header"` and the composed className
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/**
 * Layout container for dialog footer actions that stacks controls vertically on small screens and aligns them to the end on larger screens.
 *
 * @param className - Additional CSS class names to append to the footer container
 * @returns A `div` element with `data-slot="dialog-footer"`, a responsive flex layout (column-reverse on small screens, row justify-end on larger screens), and any forwarded `div` props
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a dialog title element with consistent typography and a `data-slot="dialog-title"` attribute.
 *
 * @param className - Additional CSS classes to append to the default title styling
 * @returns A React element for the dialog title with the default typography classes and any forwarded props
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders a Dialog description element with consistent default styling and a data-slot attribute.
 *
 * @param className - Additional class names to append to the default "text-muted-foreground text-sm" styles.
 * @returns A DialogPrimitive.Description element with `data-slot="dialog-description"` and merged class names; any other props are forwarded to the underlying element.
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
