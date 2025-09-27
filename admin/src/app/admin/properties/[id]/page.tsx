// admin/src/app/admin/properties/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropertyModel } from '@/lib/db/models/Property';
import { UserModel } from '@/lib/db/models/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, DollarSign, Ruler, Calendar, Home, CheckCircle, XCircle, Eye, Users, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { serializeDocuments } from '@/lib/utils/serialization';
import { formatCurrency, formatDate } from '@/lib/utils';
import Image from 'next/image';

interface PropertyDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const property = await PropertyModel.findById(params.id);
  
  if (!property) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">Property not found</p>
          <Button 
            variant="outline" 
            asChild
            className="mt-4"
          >
            <Link href="/admin/properties">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const agency = property.agencyId ? await UserModel.findById(property.agencyId) : null;
  const serializedProperty = serializeDocuments([property])[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <Link href="/admin/properties">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {serializedProperty.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Property Details & Management
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {serializedProperty.property_status === 'pending' && (
            <>
              <Button
  //onClick={handleApprove}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-green-500 hover:border-green-600"
>
  <CheckCircle className="w-4 h-4 mr-2" />
  Approve
</Button>

<Button
  //onClick={handleReject}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-red-500 hover:border-red-600"
>
  <XCircle className="w-4 h-4 mr-2" />
  Reject
</Button>
            </>
          )}
          {serializedProperty.property_status === 'approved' && (
            <Button
              variant="outline"
              className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          )}
        </div>
      </div>

      {/* Property Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="w-5 h-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={serializedProperty.property_status} />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  Value: {formatCurrency(serializedProperty.property_value)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  Size: {serializedProperty.gross_property_size} sqft
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  Listed: {formatDate(serializedProperty.createdAt)}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Monthly Rent: </span>
                <span className="text-foreground font-medium">
                  {formatCurrency(serializedProperty.proposedRentPerMonth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{serializedProperty.location?.address}</p>
              <p className="text-muted-foreground">
                Coordinates: {serializedProperty.location?.coordinates?.lat}, {serializedProperty.location?.coordinates?.lng}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agency Info */}
      {agency && (
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader>
            <CardTitle>Agency Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{agency.companyName}</p>
                <p className="text-sm text-muted-foreground">{agency.contactPerson?.email}</p>
                <p className="text-sm text-muted-foreground">{agency.contactPerson?.phoneNumber}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/agencies/${agency._id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Agency
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {serializedProperty.images && serializedProperty.images.length > 0 && (
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {serializedProperty.images.map((image: string, index: number) => (
                <div key={index} className="aspect-video relative rounded-lg overflow-hidden border border-border">
                  <Image
                    src={image}
                    alt={`${serializedProperty.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {serializedProperty.documents && serializedProperty.documents.length > 0 && (
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serializedProperty.documents.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.url.substring(0, 50)}...</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Owners */}
      {serializedProperty.property_owners && serializedProperty.property_owners.length > 0 && (
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Property Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface hover:bg-surface">
                    <TableHead className="font-semibold">Owner Address</TableHead>
                    <TableHead className="font-semibold">Ownership %</TableHead>
                    <TableHead className="font-semibold">Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serializedProperty.property_owners.map((owner: any, index: number) => (
                    <TableRow key={index} className="border-border hover:bg-surface-hover transition-smooth">
                      <TableCell className="font-mono text-sm text-foreground">{owner.owner_address}</TableCell>
                      <TableCell className="text-foreground">{owner.amount_owned}%</TableCell>
                      <TableCell className="text-foreground">{formatDate(owner.purchase_time)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}