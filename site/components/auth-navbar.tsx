"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "./wallet-connect";
const navLinks = [
  { href: "/auth/login", label: "Login" },
  { href: "/auth/investor", label: "Investor Sign Up" },
  { href: "/auth/agency", label: "Agency Sign Up" },
];
/* TODO: Work on the mobile device layout for this navbar */

export default function AuthNavbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/20 shadow-sm ">
      <div className=" mx-auto px-4 md:px-12 px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-end gap-2">
            <Image
              className="w-8 h-8"
              src="/logo.png"
              alt="logo"
              width={100}
              height={100}
            />
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              Atria
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link, _) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 hover:text-primary transition-all duration-300 font-medium rounded-lg  group ${pathname === link.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-8 group-hover:left-1/2 group-hover:-translate-x-1/2"></span>
              </Link>
            ))}
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  );
}
