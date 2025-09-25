'use client';

import { Property } from '@/lib/db/models/Property';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Home,
  MapPin,
  DollarSign
} from 'lucide-react';
import PropertyDetailModal from './PropertyDetailModal';
import PropertyApprovalModal from './PropertyApprovalModal';

interface PropertiesTableProps {
  properties: Property[];
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  searchQuery: string;
}

/**
 * Render a paginated admin table of property listings with controls to view details and approve or reject pending items.
 *
 * Renders rows for each property including thumbnail, location, value, agency, status badge, listing date, and action buttons.
 * Also shows an empty state when no properties are available and a pagination bar when multiple pages exist.
 *
 * @param properties - The list of properties to display
 * @param currentPage - The currently active page (1-based)
 * @param totalPages - Total number of available pages
 * @param currentStatus - Current status filter value (`'all'` means no status filter)
 * @param searchQuery - Current search query string (empty if none)
 * @returns A React element containing the properties table, pagination controls, and related modals
 */
export default function PropertiesTable({ 
  properties, 
  currentPage, 
  totalPages,
  currentStatus,
  searchQuery 
}: PropertiesTableProps) {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; property: Property | null; action: 'approve' | 'reject' }>({
    open: false,
    property: null,
    action: 'approve'
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (currentStatus !== 'all') params.set('status', currentStatus);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', page.toString());
    router.push(`/admin/properties?${params.toString()}`);
  };

  const handleApprove = (property: Property) => {
    setApprovalModal({ open: true, property, action: 'approve' });
  };

  const handleReject = (property: Property) => {
    setApprovalModal({ open: true, property, action: 'reject' });
  };

  return (
    <>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">Property</th>
              <th className="table-header">Location</th>
              <th className="table-header">Value & Rent</th>
              <th className="table-header">Agency</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date Listed</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {properties.map((property) => (
              <tr key={property._id?.toString()} className="hover:bg-secondary-50">
                <td className="table-cell">
                  <div className="flex items-center">
                    {property.images.length > 0 ? (
                      <Image
                        width={48}
                        height={48}
                        src={property.images[0]}
                        alt={property.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <Home className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-secondary-900">{property.name}</div>
                      <div className="text-sm text-secondary-500">
                        {property.gross_property_size} sqft
                      </div>
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-secondary-400" />
                    {property.location.address}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {formatCurrency(property.property_value)}
                    </div>
                    <div className="text-sm text-secondary-500">
                      Rent: {formatCurrency(property.proposedRentPerMonth)}/mo
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="text-sm text-secondary-900">
                    Agency ID: {property.agencyId.substring(0, 8)}...
                  </div>
                </td>
                <td className="table-cell">
                  {getStatusBadge(property.property_status)}
                </td>
                <td className="table-cell">
                  <div className="text-sm text-secondary-900">
                    {formatDate(property.createdAt)}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProperty(property)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {property.property_status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(property)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(property)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <Home className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900">No properties found</h3>
            <p className="text-secondary-500 mt-2">
              {searchQuery || currentStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No properties have been submitted yet'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          open={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {approvalModal.property && (
        <PropertyApprovalModal
          property={approvalModal.property}
          action={approvalModal.action}
          open={approvalModal.open}
          onClose={() => setApprovalModal({ open: false, property: null, action: 'approve' })}
          onSuccess={() => {
            setApprovalModal({ open: false, property: null, action: 'approve' });
            router.refresh();
          }}
        />
      )}
    </>
  );
}