// admin/src/components/layout/admin-shell.tsx
'use client';

import React from 'react';
import { AdminLayout } from './admin-layout';
import type { Session } from 'next-auth';

interface AdminShellProps {
  session: Session;
  children: React.ReactNode;
}

export default function AdminShell({ session, children }: AdminShellProps) {
  return (
    <AdminLayout session={session}>
      {children}
    </AdminLayout>
  );
}