"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { Menu, X } from "lucide-react";
const navLinks = [
  { href: "/auth/login", label: "Login" },
  { href: "/auth/investor", label: "Investor Sign Up" },
  { href: "/auth/agency", label: "Agency Sign Up" },
] as const;

function NavLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2 hover:text-primary transition-all duration-300 font-medium rounded-lg group",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
    >
      {children}
      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-8 group-hover:left-1/2 group-hover:-translate-x-1/2" />
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  isActive,
  index,
  isMenuOpen,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  index: number;
  isMenuOpen: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-muted/50 hover:text-primary transform hover:translate-x-1",
        isActive ? "text-primary bg-primary/10" : "text-muted-foreground",
      )}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: isMenuOpen
          ? "slideInFromLeft 0.3s ease-out forwards"
          : "none",
      }}
    >
      {children}
    </Link>
  );
}
function HamburgerButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="md:hidden p-2 hover:bg-muted/50 rounded-lg transition-colors"
      aria-label="Toggle mobile menu"
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X className="h-5 w-5 text-foreground transition-transform duration-200" />
      ) : (
        <Menu className="h-5 w-5 text-foreground transition-transform duration-200" />
      )}
    </button>
  );
}
export default function AuthNavbar() {
  const pathname = usePathname();
  const { isOpen: isMobileMenuOpen, toggle, close } = useMobileMenu();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/20 shadow-sm">
        <div className="mx-auto px-4 md:px-12">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  isActive={pathname === link.href}
                >
                  {link.label}
                </NavLink>
              ))}
              <ConnectButton />
            </div>

            <HamburgerButton isOpen={isMobileMenuOpen} onToggle={toggle} />
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={close}
        />

        {/* Mobile menu panel */}
        <div
          className={cn(
            "absolute top-16 left-0 right-0 bg-background/98 backdrop-blur-lg border-b border-border/20 shadow-lg transition-all duration-300 ease-out",
            isMobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0",
          )}
        >
          <nav
            className="px-4 py-6 space-y-4"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link, index) => (
              <MobileNavLink
                key={link.href}
                href={link.href}
                isActive={pathname === link.href}
                index={index}
                isMenuOpen={isMobileMenuOpen}
              >
                {link.label}
              </MobileNavLink>
            ))}

            <div
              className="px-4 pt-4 border-t border-border/20"
              style={{
                animationDelay: `${navLinks.length * 50}ms`,
                animation: isMobileMenuOpen
                  ? "slideInFromLeft 0.3s ease-out forwards"
                  : "none",
              }}
            >
              <ConnectButton accountStatus="avatar" />
            </div>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
