// admin/src/app/admin/properties/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye, MapPin, Calendar, DollarSign, Home, Ruler, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ApprovalModal } from '@/components/ui/approval-modal';

interface Property {
  _id: string;
  name: string;
  location: {
    address: string;
  };
  property_value: number;
  proposedRentPerMonth: number;
  gross_property_size: number;
  property_status: string;
  createdAt: string;
  images: string[];
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    property: Property | null;
    action: 'approve' | 'reject';
  }>({
    open: false,
    property: null,
    action: 'approve'
  });
  const [processing, setProcessing] = useState<string | null>(null);
  
  const status = searchParams?.get('status') || 'all';
  const search = searchParams?.get('search') || '';
  const page = parseInt(searchParams?.get('page') || '1', 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (search) params.set('search', search);
        params.set('page', page.toString());
        
        const response = await fetch(`/api/properties?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setProperties(data.properties);
          setStats(data.stats);
        } else {
          console.error('Error fetching properties:', data.error);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, search, page]);

  const getStatusCount = (status: string) => {
    const match = stats.propertyStats?.find((s: any) => s._id === status);
    return match?.count || 0;
  };

  const getTotalValue = () => {
    return stats.propertyStats?.reduce((total: number, stat: any) => total + (stat.totalValue || 0), 0) || 0;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search') as string;
    
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (searchValue) params.set('search', searchValue);
    params.set('page', '1');
    
    router.push(`/admin/properties?${params.toString()}`);
  };

  const handleStatusFilter = (value: string) => {
    const params = new URLSearchParams();
    if (value !== 'all') params.set('status', value);
    if (search) params.set('search', search);
    params.set('page', '1');
    
    router.push(`/admin/properties?${params.toString()}`);
  };

  const handleRowClick = (propertyId: string) => {
    router.push(`/admin/properties/${propertyId}`);
  };

  const handleApproveClick = (property: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovalModal({
      open: true,
      property,
      action: 'approve'
    });
  };

  const handleRejectClick = (property: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovalModal({
      open: true,
      property,
      action: 'reject'
    });
  };

  const handleApprovalConfirm = async (message: string) => {
    if (!approvalModal.property) return;

    setProcessing(approvalModal.property._id);
    try {
      const endpoint = approvalModal.action === 'approve' ? '/api/properties/approve' : '/api/properties/reject';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: approvalModal.property._id,
          message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newStatus = approvalModal.action === 'approve' ? 'approved' : 'rejected';
        setProperties(prev =>
          prev.map(p => p._id === approvalModal.property!._id ? { ...p, property_status: newStatus } : p)
        );
        // adjust stats if present
        setStats((prev: any) => {
          if (!prev?.propertyStats) return prev;
          const next = [...prev.propertyStats];
          const dec = next.find((s: any) => s._id === 'pending'); if (dec) dec.count = Math.max(0, (dec.count || 0) - 1);
          const inc = next.find((s: any) => s._id === newStatus); if (inc) inc.count = (inc.count || 0) + 1; else next.push({ _id: newStatus, count: 1 });
          return { ...prev, propertyStats: next };
        });
        setApprovalModal({ open: false, property: null, action: 'approve' });
      } else {
        throw new Error(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Approval error:', error);
      throw error;
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties Management</h1>
            <p className="text-muted-foreground mt-1">Review and manage tokenized properties</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Properties Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage tokenized properties</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-orange-400">{getStatusCount('pending')}</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Properties</p>
                <p className="text-2xl font-bold text-green-400">{getStatusCount('approved')}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalCount}</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(getTotalValue())}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table Card */}
      <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Properties List</CardTitle>
              <CardDescription>Manage and review tokenized properties</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                name="search"
                placeholder="Search properties..."
                defaultValue={search}
                className="pl-10 bg-surface border-border focus:ring-2 focus:ring-green-500/50"
              />
            </form>
            <Select value={status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40 bg-surface border-border">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Properties Table with Clickable Rows */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow className="bg-surface hover:bg-surface">
                  <TableHead className="font-semibold">Property</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Value & Rent</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property: any) => (
                  <TableRow 
                    key={property._id} 
                    className="clickable group"
                    onClick={() => handleRowClick(property._id)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-green-400 transition-colors">
                            {property.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Ruler className="w-3 h-3" />
                            {property.gross_property_size} sqft
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {property.location?.address?.substring(0, 30)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-semibold text-foreground">
                          <DollarSign className="h-4 w-4 mr-1 text-green-400" />
                          {formatCurrency(property.property_value)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Rent: {formatCurrency(property.proposedRentPerMonth)}/mo
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={property.property_status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">
                        {formatDate(property.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end">
                        {property.property_status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => handleApproveClick(property, e)}
                              disabled={processing === property._id}
                              className="bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400 hover:text-green-300 transition-all disabled:opacity-50"
                            >
                              {processing === property._id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => handleRejectClick(property, e)}
                              disabled={processing === property._id}
                              className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                            >
                              {processing === property._id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              Reject
                            </Button>
                          </>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="hover:bg-green-500/10 hover:text-green-400">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/properties/${property._id}`} className="cursor-pointer hover:bg-green-500/10">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {property.property_status === 'approved' && (
                                <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No properties found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || status !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No properties have been submitted yet'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {stats.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {page} of {stats.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', (page - 1).toString());
                    router.push(`/admin/properties?${params.toString()}`);
                  }}
                  className="hover:border-green-500 hover:text-green-400"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= stats.totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', (page + 1).toString());
                    router.push(`/admin/properties?${params.toString()}`);
                  }}
                  className="hover:border-green-500 hover:text-green-400"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <ApprovalModal
        open={approvalModal.open}
        onClose={() => setApprovalModal({ open: false, property: null, action: 'approve' })}
        onConfirm={handleApprovalConfirm}
        title={approvalModal.action === 'approve' ? 'Approve Property' : 'Reject Property'}
        description={
          approvalModal.action === 'approve' 
            ? `Approve "${approvalModal.property?.name}" for listing? This property will become visible to investors.`
            : `Reject "${approvalModal.property?.name}" listing? Please provide a reason for rejection.`
        }
        actionType={approvalModal.action}
        confirmButtonText={approvalModal.action === 'approve' ? 'Approve Property' : 'Reject Property'}
      />
    </div>
  );
}