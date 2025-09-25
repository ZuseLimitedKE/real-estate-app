import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property } from '@/lib/db/models/Property';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RecentActivitiesProps {
  properties: Property[];
}

/**
 * Render a "Recent Properties" card showing a compact list of properties with their key details and a link to view all.
 *
 * Displays each property's name, address, formatted value, a status badge (shows "Pending", "Approved", or "Rejected" and defaults to "Pending" for unrecognized statuses), and the formatted creation date. If `properties` is empty, shows a centered "No recent properties found" message.
 *
 * @param properties - Array of Property objects to display in the list.
 * @returns A Card element containing the recent properties summary list.
 */
export default function RecentActivities({ properties }: RecentActivitiesProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Properties</span>
          <Link href="/admin/properties" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property._id?.toString()} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏠</span>
                </div>
                <div>
                  <p className="font-medium text-secondary-900">{property.name}</p>
                  <p className="text-sm text-secondary-500">{property.location.address}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-secondary-900">{formatCurrency(property.property_value)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(property.property_status)}
                  <span className="text-xs text-secondary-500">
                    {formatDate(property.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {properties.length === 0 && (
            <div className="text-center py-8 text-secondary-500">
              No recent properties found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}