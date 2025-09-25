'use client';

import Link from 'next/link';
import {
  BarChart3,
  Building2,
  Home,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Agencies', href: '/admin/agencies', icon: Building2 },
  { name: 'Properties', href: '/admin/properties', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Documents', href: '/admin/documents', icon: FileText }
];

interface SidebarProps {
  currentPath: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default function Sidebar({ currentPath, open, setOpen }: SidebarProps) {
  return (
    <>
      {/* ---------- Desktop / large screens: in-flow sidebar (affects layout width) ---------- */}
      <div
        className={cn(
          'hidden lg:flex flex-col transition-all duration-300 ease-in-out border-r border-secondary-800 bg-[color:var(--card)]',
          open ? 'w-64' : 'w-20',
          // ensure it doesn't shrink
          'flex-none'
        )}
        aria-hidden={false}
      >
        <div className={cn('flex items-center justify-between h-16 px-3 border-b border-secondary-200', !open ? 'px-2' : 'px-4')}>
          <div className={cn('flex items-center gap-3', !open ? 'justify-center w-full' : '')}>
            <div className={cn(!open ? 'w-8 h-8' : 'w-9 h-9', 'bg-[color:var(--primary)] rounded-lg flex items-center justify-center')}>
              <span className="text-[color:var(--primary-foreground)] font-bold text-sm">A</span>
            </div>
            {open && <span className="font-bold text-lg text-primary-700">Atria</span>}
          </div>

          <button
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl border border-secondary-200 hover:bg-secondary-50"
          >
            {open ? <ChevronLeft className="h-4 w-6" /> : <ChevronRight className="h-2 w-2" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-elegant'
                      : 'text-secondary-700 hover:bg-secondary-50',
                    open ? 'px-3 py-2' : 'p-2 justify-center'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? '' : 'text-secondary-400')} />
                  {open && <span className="ml-3 truncate">{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-secondary-200">
          <div className={cn('flex items-center', !open ? 'justify-center' : '')}>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium">N</span>
            </div>
            {open && (
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-700">Admin User</p>
                <p className="text-xs text-secondary-500">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Mobile: overlay drawer ---------- */}
      {/* Render overlay when open on small screens */}
      <div className={cn('lg:hidden')}>
        {/* backdrop */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 transition-opacity duration-200"
          />
        )}

        <div
          className={cn(
            'fixed z-40 top-0 left-0 h-full bg-[color:var(--card)] border-r border-secondary-200 transition-transform duration-300 ease-in-out lg:hidden',
            open ? 'translate-x-0 w-72' : '-translate-x-full w-72'
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[color:var(--primary)] rounded-lg flex items-center justify-center">
                <span className="text-[color:var(--primary-foreground)] font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg text-primary-700">Atria</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="p-2 rounded-md border border-secondary-200 hover:bg-secondary-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3 text-secondary-400" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
