"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { logout } from "@/server-actions/auth/auth";
import { Heart, Briefcase, Home, Menu, X, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppNavbar() {
  const navItems = [
    {
      name: "View Properties",
      link: "/investors",
      icon: <Home className="w-4 h-4" />,
    },
    {
      name: "Marketplace",
      link: "/investors/marketplace",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      name: "My Portfolio",
      link: "/investors/portfolio",
      icon: <User className="w-4 h-4" />,
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
          
          <WalletConnect />
          <NavbarButton
            variant="primary"
            as="button"
            onClick={async () => {
              await logout();
            }}
          >
            Logout
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4">
            <WalletConnect />
            <NavbarButton
              variant="primary"
              className="w-full"
              as="button"
              onClick={async () => {
                setIsMobileMenuOpen(false);
                await logout();
              }}
            >
              Logout
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
