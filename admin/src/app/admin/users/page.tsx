// admin/src/app/admin/users/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
// admin/src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Users, UserCheck, Building2, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface User {
  _id: string;
  role: string;
  status: string;
  email: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  contactPerson?: {
    phoneNumber: string;
  };
  phoneNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeInvestors: 0,
    approvedAgencies: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (response.ok) {
          setUsers(data.users);
          setStats(data.stats);
        } else {
          console.error('Error fetching users:', data.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleBadge = (role: string) => {
    const variants = {
      INVESTOR: { label: 'Investor', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      AGENCY: { label: 'Agency', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
      ADMIN: { label: 'Admin', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
    };
    
    const variant = variants[role as keyof typeof variants] || variants.INVESTOR;
    return <Badge className={variant.class}>{variant.label}</Badge>;
  };

  const getUserDisplayName = (user: any) => {
    if (user.role === 'AGENCY') return user.companyName || 'Agency';
    if (user.role === 'INVESTOR') return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Investor';
    if (user.role === 'ADMIN') return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';
    return 'User';
  };

  const getUserContact = (user: any) => {
    if (user.role === 'AGENCY' && user.contactPerson) {
      return user.contactPerson.phoneNumber || 'No phone';
    }
    return user.phoneNumber || 'No phone';
  };

  const handleRowClick = (userId: string, userRole: string) => {
    if (userRole === 'AGENCY') {
      router.push(`/admin/agencies/${userId}`);
    } else {
      router.push(`/admin/users/${userId}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-1">Manage all platform users</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage all platform users</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6 text-purple-400" />}
          iconBg="bg-purple-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
        <DashboardCard
          title="Active Investors"
          value={stats.activeInvestors}
          icon={<UserCheck className="h-6 w-6 text-blue-400" />}
          iconBg="bg-blue-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
        <DashboardCard
          title="Approved Agencies"
          value={stats.approvedAgencies}
          icon={<Building2 className="h-6 w-6 text-green-400" />}
          iconBg="bg-green-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
      </div>

      {/* Enhanced Users Table */}
      <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold">All Users</CardTitle>
          <CardDescription>Manage platform users and their permissions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow className="bg-surface hover:bg-surface">
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Role & Status</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Registration Date</TableHead>
                  <TableHead className="font-semibold">Last Login</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow 
                    key={user._id} 
                    className="clickable group"
                    onClick={() => handleRowClick(user._id, user.role)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-purple-400 transition-colors">
                            {getUserDisplayName(user)}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getRoleBadge(user.role)}
                        <StatusBadge status={user.status.toLowerCase()} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getUserContact(user)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="hover:border-purple-500 hover:text-purple-400"
                        >
                          <Link href={user.role === 'AGENCY' ? `/admin/agencies/${user._id}` : `/admin/users/${user._id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        {user.status === 'PENDING' && user.role === 'AGENCY' && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            asChild
                            className="btn-primary"
                          >
                            <Link href={`/admin/agencies/${user._id}`}>
                              Review
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No users found</h3>
                <p className="text-muted-foreground mt-2">No users have registered on the platform yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}