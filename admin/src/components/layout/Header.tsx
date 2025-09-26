// apps/admin/src/components/layout/Header.tsx
'use client';

import { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Bell, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  session: Session;
  onMenu?: () => void; // called when mobile menu button is clicked
}

export default function Header({ session, onMenu }: HeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="flex-shrink-0 z-10 flex items-center justify-between h-16 bg-[color:var(--card)] border-b border-secondary-200 px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        {/* Mobile menu icon */}
        <button
          className="lg:hidden p-2 rounded-md hover:bg-secondary-50"
          onClick={() => onMenu?.()}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-secondary-600" />
        </button>

        <h1 className="text-xl font-semibold text-secondary-500">Welcome Back, Admin</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-secondary-500 hover:text-secondary-700 transition-colors">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            
            <p className="text-xs text-secondary-500">Administrator</p>
          </div>

          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="border border-border/60 hover:bg-secondary-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
