import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import {Providers} from "@/components/providers";
import "./globals.css";
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: {
    template: `%s|${siteConfig.name}`,
    default: siteConfig.name,
  },
  description: siteConfig.description,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
