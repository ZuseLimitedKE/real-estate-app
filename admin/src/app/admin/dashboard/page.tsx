// admin/src/app/admin/dashboard/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PropertyModel } from '@/lib/db/models/Property';
import { UserModel } from '@/lib/db/models/User';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Home, Users, DollarSign, Clock, Eye, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Fetch real data from database
  const [agencyStats, propertyStats, recentProperties, pendingAgencies] = await Promise.all([
    UserModel.getAgencyStats(),
    PropertyModel.getPropertyStats(),
    PropertyModel.getRecentProperties(5),
    UserModel.findAgenciesByStatus('PENDING', 3, 0)
  ]);

  // Calculate stats
  const pendingAgenciesCount = agencyStats.find((stat: any) => stat._id === 'PENDING')?.count || 0;
  const approvedAgenciesCount = agencyStats.find((stat: any) => stat._id === 'APPROVED')?.count || 0;
  const totalAgenciesCount = pendingAgenciesCount + approvedAgenciesCount;

  const pendingPropertiesCount = propertyStats.find((stat: any) => stat._id === 'pending')?.count || 0;
  const approvedPropertiesCount = propertyStats.find((stat: any) => stat._id === 'approved')?.count || 0;
  const totalPropertiesCount = pendingPropertiesCount + approvedPropertiesCount;
  const totalPropertyValue = propertyStats.reduce((sum: number, stat: any) => sum + (stat.totalValue || 0), 0);

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg text-muted-foreground">
            Manage real estate tokenization platform operations
          </p>
        </div>
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          All Systems Operational
        </Badge>
      </div>

      {/* Enhanced KPI Grid with colorful icons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Agencies"
          value={approvedAgenciesCount}
          icon={<Building2 className="h-6 w-6 text-blue-400" />}
          iconBg="bg-blue-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
        <DashboardCard
          title="Active Properties"
          value={approvedAgenciesCount}
          icon={<Home className="h-6 w-6 text-green-400" />}
          iconBg="bg-green-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
        <DashboardCard
          title="Total Value Locked"
          value={formatCurrency(totalPropertyValue)}
          icon={<DollarSign className="h-6 w-6 text-purple-400" />}
          iconBg="bg-purple-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
        <DashboardCard
          title="Pending Reviews"
          value={pendingAgenciesCount + pendingPropertiesCount}
          icon={<Clock className="h-6 w-6 text-orange-400" />}
          iconBg="bg-orange-500/10"
          className="hover:shadow-hover transition-all duration-300"
        />
      </div>

      {/* Enhanced Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Enhanced Pending Agencies Card */}
        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Pending Agencies
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Agencies awaiting approval
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-blue-500/10 hover:text-blue-400">
              <Link href="/admin/agencies?status=pending" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAgencies.map((agency: any) => (
              <Link key={agency._id} href={`/admin/agencies/${agency._id}`} className="block">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-blue-500/30 transition-all duration-300 group/item cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground group-hover/item:text-blue-400 transition-colors truncate">
                        {agency.companyName}
                      </h4>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground truncate">{agency.contactPerson?.email}</p>
                      <p className="text-xs text-muted-foreground">Submitted: {new Date(agency.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
              </Link>
            ))}
            {pendingAgencies.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending agencies</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Recent Properties Card */}
        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Home className="h-5 w-5 text-green-400" />
                Recent Properties
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest property submissions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-green-500/10 hover:text-green-400">
              <Link href="/admin/properties" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProperties.map((property: any) => (
              <Link key={property._id} href={`/admin/properties/${property._id}`} className="block">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-green-500/30 transition-all duration-300 group/item cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground group-hover/item:text-green-400 transition-colors truncate">
                        {property.name}
                      </h4>
                      <StatusBadge status={property.property_status} />
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground truncate">{property.location?.address}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Value: {formatCurrency(property.property_value || 0)}</span>
                        <span>Size: {property.gross_property_size} sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4 text-green-400" />
                  </div>
                </div>
              </Link>
            ))}
            {recentProperties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No properties found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions with colorful cards */}
      <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Review Pending Card */}
            <Link href="/admin/agencies?status=pending">
              <div className="group p-4 rounded-xl border-2 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-orange-400 transition-colors">Review Pending</div>
                    <div className="text-xs text-muted-foreground">
                      {pendingAgenciesCount + pendingPropertiesCount} items need attention
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Generate Report Card */}

            
            {/* User Management Card */}
            <Link href="/admin/users">
              <div className="group p-4 rounded-xl border-2 border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-green-400 transition-colors">User Management</div>
                    <div className="text-xs text-muted-foreground">Manage platform access</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}