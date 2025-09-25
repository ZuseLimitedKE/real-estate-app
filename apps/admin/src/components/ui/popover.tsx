"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Wraps the Radix Popover root and adds a `data-slot="popover"` attribute.
 *
 * @param props - Props forwarded to `PopoverPrimitive.Root`
 * @returns The rendered Popover root element with the provided props applied
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

/**
 * Renders a popover trigger element.
 *
 * Renders a Radix Popover Trigger with a `data-slot="popover-trigger"` attribute and passes through any received props.
 *
 * @returns The rendered trigger element for the popover
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

/**
 * Renders popover content inside a portal with configurable alignment, offset, and styling.
 *
 * @param className - Additional CSS classes appended to the component's default styles
 * @param align - Horizontal alignment of the popover relative to the trigger; defaults to `"center"`
 * @param sideOffset - Distance in pixels between the popover and its trigger; defaults to `4`
 * @returns The rendered PopoverPrimitive.Content element wrapped in a Portal
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

/**
 * Renders a popover anchor element and forwards all received props to the underlying anchor.
 *
 * @param props - Props to pass through to the Popover anchor element
 * @returns The rendered Popover anchor element
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
