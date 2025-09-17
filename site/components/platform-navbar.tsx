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
import { logout } from "@/server-actions/auth/auth";
import Link from "next/link";
import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";

export function PlatformNavbar() {
  const navItems = [
    {
      name: "View Properties",
      link: "/investors",
    },
    {
      name: "Pricing",
      link: "#pricing",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
<<<<<<< HEAD:site/components/app-navbar.tsx
          <NavbarButton variant="secondary"><WalletConnect /> </NavbarButton>
          <NavbarButton variant="primary">Book a call</NavbarButton>
=======
          <NavbarButton
            variant="primary"
            as="button"
            onClick={async () => {
              await logout();
            }}
          >
            Logout
          </NavbarButton>
>>>>>>> 41b49ab571a6f2a8cd0eeb57b3c0c56fbeb0c64d:site/components/platform-navbar.tsx
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
<<<<<<< HEAD:site/components/app-navbar.tsx
            <WalletConnect />
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant="primary"
              className="w-full"
            >
              Book a call
=======
            <NavbarButton
              onClick={async () => {
                setIsMobileMenuOpen(false);
                await logout();
              }}
              variant="primary"
              as="button"
              className="w-full"
            >
              Logout
>>>>>>> 41b49ab571a6f2a8cd0eeb57b3c0c56fbeb0c64d:site/components/platform-navbar.tsx
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
