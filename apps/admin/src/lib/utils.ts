import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine multiple class value inputs into a single, deduplicated class string suitable for Tailwind.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.) to be combined
 * @returns A single string with merged and de-duplicated class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric value as US dollar currency using the en-US locale.
 *
 * @param amount - The numeric amount to format
 * @returns The value formatted as a USD currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a date into a long, human-readable en-US date string.
 *
 * @param date - The date to format; may be a Date object, an ISO/string parseable by Date, or a numeric timestamp
 * @returns The formatted date like "January 1, 2025", or `"Invalid date"` if the input cannot be parsed
 */
export function formatDate(date: Date | string | number): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return "Invalid date"; // fallback
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}


/**
 * Formats a date or timestamp into an en-US short date with 2-digit hour and minute.
 *
 * @param date - A Date object, an ISO/locale date string, or a numeric timestamp.
 * @returns The formatted date-time string (short month, numeric day and year, 2-digit hour and minute) or `"Invalid date"` if the input cannot be parsed.
 */
export function formatDateTime(date: Date | string | number): string {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return "Invalid date"; // fallback
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}
