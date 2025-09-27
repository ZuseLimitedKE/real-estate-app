"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  NavItem,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  MobileNavItem,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { logout } from "@/server-actions/auth/auth";
import { UserRole } from "@/auth/utils";

interface AppNavbarProps {
  role: UserRole;
}

export function AppNavbar({ role }: AppNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
  };
  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems>
          <NavItem href="/investors">View Properties</NavItem>

          {role === "agency" && (
            <>
              <NavItem href="/agencies/dashboard">Dashboard</NavItem>
            </>
          )}
          <NavItem href="#settings">Settings</NavItem>
        </NavItems>

        <div className="flex items-center gap-4">
          <WalletConnect />
          <NavbarButton variant="primary" as="button" onClick={logout}>
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
          <MobileNavItem href="/investors" onClick={handleMobileNavItemClick}>
            View Properties
          </MobileNavItem>

          {role === "agency" && (
            <>
              <MobileNavItem
                href="/agencies/dashboard"
                onClick={handleMobileNavItemClick}
              >
                Dashboard
              </MobileNavItem>
            </>
          )}
          <MobileNavItem href="#settings" onClick={handleMobileNavItemClick}>
            Settings
          </MobileNavItem>
          <MobileNavItem href="#contact" onClick={handleMobileNavItemClick}>
            Contact
          </MobileNavItem>

          <div className="flex w-full flex-col gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <WalletConnect />
            <NavbarButton
              variant="primary"
              className="w-full"
              as="button"
              onClick={handleLogout}
            >
              Logout
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
