/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel } from '@/lib/db/models/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Users, UserCheck, UserX, Mail, Phone } from 'lucide-react';

/**
 * Renders the Users Management admin page with summary statistics and a table of all users.
 *
 * Fetches INVESTOR, AGENCY, and ADMIN users, aggregates the results, and displays total counts, active/approved counts, role badges, status icons, contact details, registration and last-login dates, and contextual actions (always "View", and "Review" for agencies with pending status).
 *
 * @returns The Users Management page as a JSX element.
 */
export default async function UsersPage() {
  // Get all users by querying each role separately
  const [investors, agencies, admins] = await Promise.all([
    UserModel.findByRole('INVESTOR'),
    UserModel.findByRole('AGENCY'), 
    UserModel.findByRole('ADMIN')
  ]);

  const allUsers = [...investors, ...agencies, ...admins];

  const getRoleBadge = (role: string) => {
    const variants = {
      INVESTOR: { label: 'Investor', color: 'bg-blue-100 text-blue-800' },
      AGENCY: { label: 'Agency', color: 'bg-green-100 text-green-800' },
      ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-800' }
    };
    
    const variant = variants[role as keyof typeof variants] || variants.INVESTOR;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      APPROVED: <UserCheck className="h-4 w-4 text-green-600" />,
      PENDING: <Users className="h-4 w-4 text-yellow-600" />,
      REJECTED: <UserX className="h-4 w-4 text-red-600" />,
      SUSPENDED: <UserX className="h-4 w-4 text-gray-600" />
    };
    return icons[status as keyof typeof icons] || <Users className="h-4 w-4" />;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Users Management</h1>
        <p className="text-secondary-600 mt-2">Manage all platform users</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Users</p>
                <p className="text-2xl font-bold text-secondary-900">{allUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-green-50">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active Investors</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {investors.filter(u => u.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Approved Agencies</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {agencies.filter(u => u.status === 'APPROVED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role & Status</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Registration Date</th>
                  <th className="table-header">Last Login</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {allUsers.map((user) => (
                  <tr key={user._id?.toString()} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-secondary-900">
                            {getUserDisplayName(user)}
                          </div>
                          <div className="text-sm text-secondary-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {getRoleBadge(user.role)}
                        <div className="flex items-center text-sm">
                          {getStatusIcon(user.status)}
                          <span className="ml-1 capitalize">{user.status.toLowerCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-secondary-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-secondary-400" />
                          {getUserContact(user)}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {user.status === 'PENDING' && user.role === 'AGENCY' && (
                          <Button variant="default" size="sm">
                            Review
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {allUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900">No users found</h3>
                <p className="text-secondary-500 mt-2">No users have registered on the platform yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}