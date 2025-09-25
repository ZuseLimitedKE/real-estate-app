'use client';

import { AgencyUser } from '@/lib/db/models/User';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';

interface AgencyDetailModalProps {
  agency: AgencyUser;
  open: boolean;
  onClose: () => void;
  onApprove: (agency: AgencyUser) => void;
  onReject: (agency: AgencyUser) => void;
}

export default function AgencyDetailModal({
  agency,
  open,
  onClose,
  onApprove,
  onReject
}: AgencyDetailModalProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.PENDING;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Agency Details</span>
            {getStatusBadge(agency.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-primary-600" />
                Company Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-secondary-600">Company Name</label>
                  <p className="text-secondary-900">{agency.companyName}</p>
                </div>
                
                {agency.tradingName && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Trading Name</label>
                    <p className="text-secondary-900">{agency.tradingName}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-secondary-600">Business Type</label>
                  <p className="text-secondary-900 capitalize">{agency.businessType.toLowerCase().replace(/_/g, ' ')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-secondary-600">Established Date</label>
                  <p className="text-secondary-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-secondary-400" />
                    {formatDate(agency.establishedDate)}
                  </p>
                </div>
                
                {agency.description && (
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Description</label>
                    <p className="text-secondary-900 text-sm">{agency.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Person</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-secondary-600">Name</label>
                  <p className="text-secondary-900">
                    {agency.contactPerson.firstName} {agency.contactPerson.lastName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-secondary-600">Position</label>
                  <p className="text-secondary-900">{agency.contactPerson.position}</p>
                </div>
                
                <div className="flex items-center text-secondary-900">
                  <Mail className="h-4 w-4 mr-2 text-secondary-400" />
                  {agency.contactPerson.email}
                </div>
                
                <div className="flex items-center text-secondary-900">
                  <Phone className="h-4 w-4 mr-2 text-secondary-400" />
                  {agency.contactPerson.phoneNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Business Address & Documents */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Business Address
              </h3>
              
              <div className="space-y-2 text-secondary-900">
                <p>{agency.businessAddress.street}</p>
                <p>{agency.businessAddress.city}, {agency.businessAddress.state}</p>
                <p>{agency.businessAddress.zipCode}, {agency.businessAddress.country}</p>
              </div>
            </div>

            {/* Registration Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-secondary-600">Registration Number</label>
                  <p className="text-secondary-900">{agency.registrationNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-secondary-600">License Number</label>
                  <p className="text-secondary-900">{agency.licenseNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-secondary-600">Tax ID</label>
                  <p className="text-secondary-900">{agency.taxId}</p>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                Verification Documents
              </h3>
              
              <div className="space-y-2">
                {Object.entries(agency.verificationDocuments).map(([docType, url]) => (
                  <div key={docType} className="flex items-center justify-between p-2 border border-secondary-200 rounded">
                    <span className="text-sm capitalize">{docType.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Button variant="outline" size="sm">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {agency.status === 'PENDING' && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(agency)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Application
            </Button>
            <Button
              onClick={() => onApprove(agency)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Application
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}