// apps/admin/src/components/dashboard/DashboardStats.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Home,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
  agencyStats: any[];
  propertyStats: any[];
}

/**
 * Renders a responsive grid of statistic cards summarizing agency and property metrics.
 *
 * @param agencyStats - Array of agency statistic objects (each with `_id` status and `count`) used to derive pending, approved, and rejected agency counts.
 * @param propertyStats - Array of property statistic objects (each with `_id`, `count`, and optional `totalValue`) used to derive property counts and the aggregated property value.
 * @returns A React element containing the dashboard stats grid.
 */
export default function DashboardStats({ agencyStats, propertyStats }: DashboardStatsProps) {
  const pendingAgencies = agencyStats.find(stat => stat._id === 'PENDING')?.count || 0;
  const approvedAgencies = agencyStats.find(stat => stat._id === 'APPROVED')?.count || 0;
  const rejectedAgencies = agencyStats.find(stat => stat._id === 'REJECTED')?.count || 0;

  const pendingProperties = propertyStats.find(stat => stat._id === 'pending')?.count || 0;
  const approvedProperties = propertyStats.find(stat => stat._id === 'approved')?.count || 0;
  const rejectedProperties = propertyStats.find(stat => stat._id === 'rejected')?.count || 0;
  const totalPropertyValue = propertyStats.reduce((sum, stat) => sum + (stat.totalValue || 0), 0);

  const stats = [
    {
      title: 'Pending Agencies',
      value: pendingAgencies,
      icon: Clock,
      accent: 'bg-yellow-50 text-yellow-700'
    },
    {
      title: 'Approved Agencies',
      value: approvedAgencies,
      icon: CheckCircle,
      accent: 'bg-green-50 text-green-700'
    },
    {
      title: 'Rejected Agencies',
      value: rejectedAgencies,
      icon: XCircle,
      accent: 'bg-red-50 text-red-700'
    },
    {
      title: 'Total Properties',
      value: approvedProperties + pendingProperties + rejectedProperties,
      icon: Home,
      accent: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Total Property Value',
      value: formatCurrency(totalPropertyValue),
      icon: Building2,
      accent: 'bg-[color:var(--primary-light)] text-[color:var(--primary-foreground)]'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-soft shadow-elegant">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.accent}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
