'use client';

import { Property } from '@/lib/db/models/Property';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Home,
  MapPin,
  DollarSign,
  Ruler,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,

  Users
} from 'lucide-react';
import Image from 'next/image';

interface PropertyDetailModalProps {
  property: Property;
  open: boolean;
  onClose: () => void;
  onApprove: (property: Property) => void;
  onReject: (property: Property) => void;
}

export default function PropertyDetailModal({
  property,
  open,
  onClose,
  onApprove,
  onReject
}: PropertyDetailModalProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const amenitiesList = Object.entries(property.amenities)
    .filter(([_, value]) => value !== null && value !== false && value !== 0)
    .map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'boolean' ? 'Yes' : value
    }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Property Details</span>
            {getStatusBadge(property.property_status)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Images</h3>
            <div className="grid grid-cols-2 gap-4">
              {property.images.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${property.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            
            {property.images.length === 0 && (
              <div className="aspect-video bg-secondary-100 rounded-lg flex items-center justify-center">
                <Home className="h-12 w-12 text-secondary-400" />
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-secondary-600">Property Name</label>
                  <p className="text-secondary-900">{property.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-secondary-600">Description</label>
                  <p className="text-secondary-900 text-sm">{property.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Property Value</label>
                    <p className="text-secondary-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {formatCurrency(property.property_value)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Monthly Rent</label>
                    <p className="text-secondary-900">
                      {formatCurrency(property.proposedRentPerMonth)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Size</label>
                    <p className="text-secondary-900 flex items-center">
                      <Ruler className="h-4 w-4 mr-1 text-secondary-400" />
                      {property.gross_property_size} sqft
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-secondary-600">Service Fee</label>
                    <p className="text-secondary-900">{property.serviceFeePercent}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Location
              </h3>
              <div className="space-y-2 text-secondary-900">
                <p>{property.location.address}</p>
                <p className="text-sm text-secondary-500">
                  Lat: {property.location.coordinates.lat}, Lng: {property.location.coordinates.lng}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenitiesList.map((amenity, index) => (
                <div key={index} className="p-3 border border-secondary-200 rounded-lg">
                  <p className="font-medium text-sm">{amenity.name}</p>
                  <p className="text-secondary-600 text-sm">{amenity.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {property.documents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary-600" />
              Legal Documents
            </h3>
            <div className="space-y-2">
              {property.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-secondary-500">{doc.url.substring(0, 50)}...</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Owners */}
        {property.property_owners.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Property Owners
            </h3>
            <div className="space-y-3">
              {property.property_owners.map((owner, index) => (
                <div key={index} className="p-3 border border-secondary-200 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-secondary-600">Owner Address</label>
                      <p className="font-mono text-xs">{owner.owner_address}</p>
                    </div>
                    <div>
                      <label className="font-medium text-secondary-600">Amount Owned</label>
                      <p>{owner.amount_owned}%</p>
                    </div>
                    <div>
                      <label className="font-medium text-secondary-600">Purchase Date</label>
                      <p>{formatDate(owner.purchase_time)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {property.property_status === 'pending' && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(property)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Property
            </Button>
            <Button
              onClick={() => onApprove(property)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Property
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}