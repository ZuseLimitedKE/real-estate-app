import { ArrowRightIcon } from "@radix-ui/react-icons";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className?: string;
  background: ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: BentoCardProps) => (
  <Link
    href={href}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between rounded-xl overflow-hidden",
      "bg-background shadow-sm",
      "dark:bg-background dark:border dark:border-white/10",
      "transition-transform duration-300 hover:scale-[1.01]", // subtle lift on hover
      className,
    )}
  >
    {/* Background (clipped safely, smooth zoom on hover) */}
    <div className="absolute inset-0 overflow-hidden rounded-xl -z-10">
      <div className="h-full w-full transform transition-transform duration-500 ease-in-out group-hover:scale-105">
        {background}
      </div>
    </div>

    {/* Content */}
    <div className="relative z-10 p-6 flex flex-col gap-3 transition-transform duration-300 lg:group-hover:-translate-y-6">
      <Icon className="h-12 w-12 text-neutral-700 dark:text-neutral-300 transition-transform duration-300 group-hover:scale-95" />
      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
        {name}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
    </div>

    {/* CTA (always visible at bottom on large screens) */}
    <div className="hidden lg:flex absolute bottom-0 w-full p-4 translate-y-6 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <span className="flex items-center text-sm font-medium text-primary">
        {cta}
        <ArrowRightIcon className="ms-2 h-4 w-4 rtl:rotate-180" />
      </span>
    </div>

    {/* Overlay */}
    <div className="absolute inset-0 -z-10 bg-black/[.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-neutral-800/10" />
  </Link>
);

export { BentoCard, BentoGrid };
