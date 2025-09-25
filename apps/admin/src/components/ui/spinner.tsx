import React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva("flex-col items-center justify-center", {
  variants: {
    show: {
      true: "flex",
      false: "hidden",
    },
  },
  defaultVariants: {
    show: true,
  },
});

const loaderVariants = cva("animate-spin text-white", {
  variants: {
    size: {
      small: "size-6",
      medium: "size-8",
      large: "size-12",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
  VariantProps<typeof loaderVariants> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Renders a spinner with configurable size and visibility.
 *
 * Renders a span containing a spinning Loader2 icon and any provided children. The `show` prop controls whether the spinner is visible, and the `size` prop selects the icon size.
 *
 * @param size - Icon size variant; defaults to `"medium"`.
 * @param show - Whether the spinner is visible; defaults to `true`.
 * @param className - Additional class names applied to the icon.
 * @param children - Optional content rendered after the icon.
 * @returns A span element containing the spinning icon and any children.
 */
export function Spinner({
  size,
  show,
  children,
  className,
}: SpinnerContentProps) {
  return (
    <span className={spinnerVariants({ show })}>
      <Loader2 className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  );
}
