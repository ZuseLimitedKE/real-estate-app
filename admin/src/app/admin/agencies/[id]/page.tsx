// admin/src/app/admin/agencies/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel } from "@/lib/db/models/User";
import { PropertyModel } from "@/lib/db/models/Property";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building, TrendingUp, CheckCircle, XCircle, FileText } from "lucide-react";
import Link from "next/link";
import { serializeDocuments } from "@/lib/utils/serialization";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AgencyDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function AgencyDetailsPage({
  params,
}: AgencyDetailsPageProps) {
  const agency = await UserModel.findById(params.id);
  
  if (!agency || agency.role !== "AGENCY") {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">Agency not found</p>
          <Button 
            variant="outline" 
            asChild
            className="mt-4"
          >
            <Link href="/admin/agencies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agencies
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get properties for this agency
  const properties = await PropertyModel.findByStatus("approved", 50, 0);
  const agencyProperties = properties.filter((prop: any) => prop.agencyId === agency._id?.toString());

  const serializedAgency = serializeDocuments([agency])[0];

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
            <Link href="/admin/agencies">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {serializedAgency.companyName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Agency Details & Properties
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {serializedAgency.status === "PENDING" && (
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
          {serializedAgency.status === "APPROVED" && (
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

      {/* Agency Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Basic Info */}
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              Agency Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={serializedAgency.status.toLowerCase()} />
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{serializedAgency.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{serializedAgency.contactPerson?.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {serializedAgency.businessAddress?.city}, {serializedAgency.businessAddress?.state}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  Founded {new Date(serializedAgency.establishedDate).getFullYear()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Stats */}
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Portfolio Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Properties</span>
              <span className="text-2xl font-semibold text-foreground">{agencyProperties.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Value</span>
              <span className="text-2xl font-semibold text-success">
                {formatCurrency(agencyProperties.reduce((sum: number, prop: any) => sum + (prop.property_value || 0), 0))}
              </span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted</span>
                <span className="text-foreground">{formatDate(serializedAgency.createdAt)}</span>
              </div>
              {serializedAgency.approvedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="text-foreground">{formatDate(serializedAgency.approvedAt)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* License & Legal */}
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              License & Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">License Number</p>
              <p className="font-mono text-sm bg-surface px-3 py-2 rounded border border-border">{serializedAgency.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Registration</p>
              <p className="text-sm text-foreground">{serializedAgency.registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tax ID</p>
              <p className="text-sm text-foreground">{serializedAgency.taxId}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Person */}
      <Card className="bg-card border-border shadow-minimal">
        <CardHeader>
          <CardTitle>Contact Person</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-foreground">Personal Information</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="text-foreground">{serializedAgency.contactPerson?.firstName} {serializedAgency.contactPerson?.lastName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Position: </span>
                  <span className="text-foreground">{serializedAgency.contactPerson?.position}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="text-foreground">{serializedAgency.contactPerson?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="text-foreground">{serializedAgency.contactPerson?.phoneNumber}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-foreground">Business Address</h4>
              <div className="space-y-2 text-sm text-foreground">
                <p>{serializedAgency.businessAddress?.street}</p>
                <p>{serializedAgency.businessAddress?.city}, {serializedAgency.businessAddress?.state}</p>
                <p>{serializedAgency.businessAddress?.zipCode}, {serializedAgency.businessAddress?.country}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      {agencyProperties.length > 0 && (
        <Card className="bg-card border-border shadow-minimal">
          <CardHeader>
            <CardTitle>Properties Portfolio</CardTitle>
            <CardDescription>
              Properties listed by {serializedAgency.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface hover:bg-surface">
                    <TableHead className="font-semibold">Property</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Value</TableHead>
                    <TableHead className="font-semibold">Size</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencyProperties.map((property: any) => (
                    <TableRow key={property._id} className="border-border hover:bg-surface-hover transition-smooth">
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{property.name}</div>
                          <div className="text-sm text-muted-foreground">{property.location?.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">Residential</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-success">{formatCurrency(property.property_value)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {property.gross_property_size} sqft
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={property.property_status} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{formatDate(property.createdAt)}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {agencyProperties.length === 0 && (
        <Card className="bg-card border-border shadow-minimal">
          <CardContent className="py-12 text-center">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No properties listed yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {serializedAgency.companyName} hasn&apos;t submitted any properties for tokenization yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}