'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Session } from 'next-auth';

interface AdminShellProps {
  session: Session;
  children: React.ReactNode;
}

export default function AdminShell({ session, children }: AdminShellProps) {
  const [open, setOpen] = useState<boolean>(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('admin.sidebar.open');
      if (cached !== null) setOpen(cached === 'true');
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('admin.sidebar.open', String(open));
    } catch (e) {}
  }, [open]);

  return (
    <div className="min-h-screen flex bg-secondary-50">
      {/* Desktop in-flow sidebar */}
      <Sidebar currentPath={''} open={open} setOpen={setOpen} />

      {/* Page area (header + content). Because Sidebar is in-flow on lg, this will shrink/expand */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <Header session={session} onMenu={() => setOpen(prev => !prev)} />
        <main className="flex-1 overflow-auto p-6 transition-all duration-300">
          {children}
        </main>
      </div>

      {/* Note: Sidebar handles its own mobile overlay rendering (so nothing to do here) */}
    </div>
  );
}
