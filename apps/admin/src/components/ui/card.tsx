import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card container component that renders a styled div with a `data-slot="card"` attribute.
 *
 * @param className - Additional class names to merge with the component's base styling
 * @returns The rendered card container element
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card header slot with responsive grid layout and spacing.
 *
 * @returns A div element with `data-slot="card-header"` whose className applies the header grid layout, spacing, and any provided `className`; all other div props are forwarded.
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled div used as the card's title slot.
 *
 * @returns A div element with `data-slot="card-title"` and base typography classes (`leading-none`, `font-semibold`) applied; any provided `className` and other div props are forwarded.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's description slot with muted, small body text styling.
 *
 * @returns A `div` element with `data-slot="card-description"` and classes for muted foreground and small text; additional props are forwarded to the element.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * Renders the card's action slot positioned at the top-right of the card grid.
 *
 * @param className - Additional CSS classes to merge with the component's positioning classes
 * @returns A `div` element with `data-slot="card-action"` and layout classes that place action content at the card's top-right
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the card's main content area.
 *
 * The element receives horizontal padding and merges any provided `className`.
 *
 * @param className - Additional class names to apply to the content container
 * @param props - Other props forwarded to the underlying `div` element
 * @returns A `div` element that serves as the card content container
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * Renders the footer slot for a Card, providing horizontal padding and aligned layout for footer content.
 *
 * @returns A `div` element with `data-slot="card-footer"`, flex alignment, and padding intended for card footers.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
