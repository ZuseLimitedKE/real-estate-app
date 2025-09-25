'use client';

import { AgencyUser } from '@/lib/db/models/User';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import AgencyDetailModal from './AgencyDetailModal';
import ApprovalModal from './ApprovalModal';

interface AgenciesTableProps {
  agencies: AgencyUser[];
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  searchQuery: string;
}

/**
 * Renders a paginated table of agency applications with controls to view details and approve or reject pending entries.
 *
 * Displays agency rows with contact and registration details, status badges, date applied, and contextual action buttons.
 * Preserves `currentStatus` and `searchQuery` when changing pages, shows an empty state when no agencies match, and opens
 * modals for viewing details and confirming approval/rejection. Refreshes the page after successful approval/rejection.
 *
 * @param agencies - List of agency records to display
 * @param currentPage - Currently active page number (1-based)
 * @param totalPages - Total number of available pages
 * @param currentStatus - Active status filter (e.g., `'all'`, `'PENDING'`, `'APPROVED'`, etc.)
 * @param searchQuery - Current search query used to filter results
 * @returns The table UI including pagination controls and modals for agency details and approval actions
 */
export default function AgenciesTable({ 
  agencies, 
  currentPage, 
  totalPages,
  currentStatus,
  searchQuery 
}: AgenciesTableProps) {
  const router = useRouter();
  const [selectedAgency, setSelectedAgency] = useState<AgencyUser | null>(null);
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; agency: AgencyUser | null; action: 'approve' | 'reject' }>({
    open: false,
    agency: null,
    action: 'approve'
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
      SUSPENDED: { label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.PENDING;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (currentStatus !== 'all') params.set('status', currentStatus);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', page.toString());
    router.push(`/admin/agencies?${params.toString()}`);
  };

  const handleApprove = (agency: AgencyUser) => {
    setApprovalModal({ open: true, agency, action: 'approve' });
  };

  const handleReject = (agency: AgencyUser) => {
    setApprovalModal({ open: true, agency, action: 'reject' });
  };

  return (
    <>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="table-header">Agency</th>
              <th className="table-header">Contact Info</th>
              <th className="table-header">Registration</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date Applied</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {agencies.map((agency) => (
              <tr key={agency._id?.toString()} className="hover:bg-secondary-50">
                <td className="table-cell">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-secondary-900">{agency.companyName}</div>
                      {agency.tradingName && (
                        <div className="text-sm text-secondary-500">Trading as: {agency.tradingName}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-secondary-400" />
                      {agency.contactPerson.email}
                    </div>
                    <div className="flex items-center text-sm text-secondary-500">
                      <Phone className="h-4 w-4 mr-2 text-secondary-400" />
                      {agency.contactPerson.phoneNumber}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Reg:</span> {agency.registrationNumber}
                    </div>
                    <div className="text-sm text-secondary-500">
                      <span className="font-medium">License:</span> {agency.licenseNumber}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  {getStatusBadge(agency.status)}
                </td>
                <td className="table-cell">
                  <div className="text-sm text-secondary-900">
                    {formatDate(agency.createdAt)}
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAgency(agency)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {agency.status === 'PENDING' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(agency)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(agency)}
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

        {agencies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900">No agencies found</h3>
            <p className="text-secondary-500 mt-2">
              {searchQuery || currentStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No agency applications have been submitted yet'
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
      {selectedAgency && (
        <AgencyDetailModal
          agency={selectedAgency}
          open={!!selectedAgency}
          onClose={() => setSelectedAgency(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {approvalModal.agency && (
        <ApprovalModal
          agency={approvalModal.agency}
          action={approvalModal.action}
          open={approvalModal.open}
          onClose={() => setApprovalModal({ open: false, agency: null, action: 'approve' })}
          onSuccess={() => {
            setApprovalModal({ open: false, agency: null, action: 'approve' });
            router.refresh(); // Refresh the page to show updated data
          }}
        />
      )}
    </>
  );
}