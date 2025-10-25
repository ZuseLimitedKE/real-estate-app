"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  NavItem,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  MobileNavItem,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { UserRole } from "@/auth/utils";
import { LogoutButton } from "./logout-button";
import { Home, User, Activity } from "lucide-react";
interface AppNavbarProps {
  role: UserRole;
}

export function AppNavbar({ role }: AppNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems>
          <NavItem href="/investors" icon={Home}>
            Marketplace
          </NavItem>
          {role === "investor" && (
            <>
              <NavItem href="/investors/portfolio" icon={User}>
                Portfolio
              </NavItem>
            </>
          )}
          {role === "agency" && (
            <NavItem href="/agencies/dashboard" icon={Activity}>
              Agency Dashboard
            </NavItem>
          )}
        </NavItems>

        <div className="flex items-center gap-4">
          <ConnectButton accountStatus="avatar" />
          <LogoutButton variant="primary" />
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
          <MobileNavItem
            href="/investors"
            onClick={handleMobileNavItemClick}
            icon={Home}
          >
            Marketplace
          </MobileNavItem>

          {role === "agency" && (
            <MobileNavItem
              href="/agencies/dashboard"
              onClick={handleMobileNavItemClick}
              icon={Activity}
            >
              Agency Dashboard
            </MobileNavItem>
          )}
          {role === "investor" && (
            <>
              <NavItem
                href="/investors/portfolio"
                icon={User}
                onClick={handleMobileNavItemClick}
              >
                Portfolio
              </NavItem>
            </>
          )}

          <div className="flex w-full flex-col gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <ConnectButton accountStatus="avatar" />
            <LogoutButton variant="primary" />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
