"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Renders a Radix Select.Root with data-slot="select".
 *
 * Forwards all received props to the underlying Radix primitive.
 *
 * @returns The rendered Radix Select.Root element.
 */
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

/**
 * Renders a grouped container for select items.
 *
 * Wrapper around Radix UI's Select Group that injects `data-slot="select-group"` and forwards all received props to the underlying primitive.
 */
function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

/**
 * Wraps Radix's Select.Value and forwards all props.
 *
 * Renders a SelectPrimitive.Value with data-slot="select-value" and passes through any received props/children.
 *
 * @returns A JSX element rendering the underlying Radix select value.
 */
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

/**
 * Styled trigger button for the Select that displays the current value and a down chevron.
 *
 * Renders a Radix Select Trigger with project styles, sets `data-slot="select-trigger"` and `data-size` (controls height: `"default"` => h-9, `"sm"` => h-8), and forwards all other props to the underlying primitive. Includes a right-aligned chevron icon and accepts children to render the selected value or custom content.
 *
 * @param size - Optional visual size variant; `"default"` (default) or `"sm"`. Controls trigger height and related spacing.
 * @returns A JSX element wrapping Radix's SelectTrigger with styling and an embedded ChevronDownIcon.
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/**
 * Renders the Select dropdown content inside a Radix Portal with built-in styling, scrolling controls, and animations.
 *
 * The component wraps `SelectPrimitive.Content` and adds a top/bottom scroll button, a viewport for children, and CSS class variants for entrance/exit animations and side-specific transforms.
 *
 * @param className - Additional CSS classes to merge with the component's default styling.
 * @param children - Content to render inside the select viewport (typically `SelectItem`, `SelectLabel`, etc.).
 * @param position - Placement mode passed to the underlying Radix `Content`. When `"popper"` (default) the component applies sizing and translation classes appropriate for popper positioning.
 * @returns A JSX element rendering the portal-hosted select content.
 */
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/**
 * Styled wrapper around Radix Select's Label that adds project classes and a data-slot.
 *
 * Renders a SelectPrimitive.Label with consistent text/spacing classes and `data-slot="select-label"`.
 * All other props are forwarded to the underlying Radix component.
 *
 * @returns The rendered Select label element.
 */
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

/**
 * A styled wrapper around Radix's Select Item that renders an option with a right-aligned check indicator.
 *
 * Renders a SelectPrimitive.Item with project styling and data-slot="select-item". The item's visible label is the component's children; when the item is selected, a CheckIcon is displayed inside the ItemIndicator on the right. All received props are forwarded to the underlying Radix primitive and `className` is merged with the component's base classes.
 */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

/**
 * Styled wrapper around Radix's Select Separator.
 *
 * Renders a SelectPrimitive.Separator with project default styling and a
 * data-slot="select-separator" attribute. All received props (including
 * className) are forwarded to the underlying Radix component.
 */
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

/**
 * Scroll-up button for Select lists.
 *
 * Renders a Radix Select ScrollUpButton with project styles, a `data-slot="select-scroll-up-button"` attribute, and a ChevronUpIcon.
 *
 * @returns A JSX element rendering the scroll-up control.
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

/**
 * Styled wrapper around Radix's Select ScrollDownButton that renders a chevron-down icon.
 *
 * Renders a ScrollDownButton with data-slot="select-scroll-down-button", merges `className`
 * with the component's base layout classes, includes a down chevron icon, and forwards all other props to the underlying Radix primitive.
 *
 * @returns The rendered Select ScrollDownButton element.
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
