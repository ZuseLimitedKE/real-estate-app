import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Primary wrapper for a card UI.
 *
 * Renders a div with data-slot="card" and sensible default styling for a card
 * (background, foreground, rounded border, spacing, and shadow). Additional HTML
 * div props are forwarded to the underlying element and any `className` passed
 * will be merged with the component's default classes.
 *
 * @param className - Optional additional CSS classes to merge with the defaults
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
 * Header area for a Card component.
 *
 * Renders a div with `data-slot="card-header"` and a set of layout and spacing utility classes
 * suitable for a card header (grid-based layout, responsive columns when a `card-action` slot is present,
 * and optional bottom padding when bordered). Any additional props are forwarded to the underlying div.
 *
 * @param className - Optional additional CSS class names to be merged with the component's default classes.
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
 * Renders the card title slot.
 *
 * This component outputs a `div` with `data-slot="card-title"` and default typographic styles
 * ("leading-none font-semibold"). Any `className` provided will be merged with the defaults,
 * and all other `div` props are forwarded to the element.
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
 * Renders the card description area.
 *
 * Produces a div with `data-slot="card-description"` and default classes `text-muted-foreground text-sm`; any `className` and other div props passed to the component are merged and forwarded to the underlying element.
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
 * Layout container for action elements within a Card.
 *
 * Renders a div with `data-slot="card-action"` that positions controls (e.g., buttons)
 * in the card header grid. Applies the default layout classes
 * "col-start-2 row-span-2 row-start-1 self-start justify-self-end" and merges any
 * provided `className`. All other div props are forwarded to the underlying element.
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
 * Content container for a Card.
 *
 * Renders a div with `data-slot="card-content"` and a default horizontal padding of `px-6`.
 * Any `className` provided will be merged with the default class, and all other props are
 * forwarded to the underlying div (e.g., `children`, event handlers, id, aria-* attributes).
 *
 * @param className - Additional CSS classes to merge with the default `px-6`.
 * @returns A JSX element representing the card content container.
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
 * Footer container for a Card layout.
 *
 * Renders a div with data-slot="card-footer" and default classes
 * "flex items-center px-6 [.border-t]:pt-6". Any provided `className` is
 * merged with the defaults and all other div props are forwarded to the
 * underlying element.
 *
 * @param className - Additional CSS classes to merge with the default footer styles.
 * @returns The rendered footer div element.
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
