// admin/src/app/admin/agencies/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye, Mail, Phone, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { ApprovalModal } from '@/components/ui/approval-modal';

interface Agency {
  _id: string;
  companyName: string;
  contactPerson: {
    email: string;
    phoneNumber: string;
  };
  businessAddress: {
    city: string;
    state: string;
  };
  licenseNumber: string;
  status: string;
  registrationNumber: string;
  businessType: string;
  createdAt: string;
  approvedAt?: string;
}

export default function AgenciesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    agency: Agency | null;
    action: 'approve' | 'reject';
  }>({
    open: false,
    agency: null,
    action: 'approve'
  });
  const [processing, setProcessing] = useState<string | null>(null);
  
  const status = searchParams?.get('status') || "all";
  const search = searchParams?.get('search') || "";
  const page = parseInt(searchParams?.get('page') || "1", 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (search) params.set('search', search);
        params.set('page', page.toString());
        
        const response = await fetch(`/api/agencies?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          setAgencies(data.agencies);
          setStats(data.stats);
        } else {
          console.error('Error fetching agencies:', data.error);
        }
      } catch (error) {
        console.error('Error fetching agencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, search, page]);

  const getStatusCount = (status: string) => {
    const match = stats.agencyStats?.find((s: any) => s._id === status);
    return match?.count || 0;
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search') as string;
    
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (searchValue) params.set('search', searchValue);
    params.set('page', '1');
    
    router.push(`/admin/agencies?${params.toString()}`);
  };

  const handleStatusFilter = (value: string) => {
    const params = new URLSearchParams();
    if (value !== 'all') params.set('status', value);
    if (search) params.set('search', search);
    params.set('page', '1');
    
    router.push(`/admin/agencies?${params.toString()}`);
  };

  const handleRowClick = (agencyId: string) => {
    router.push(`/admin/agencies/${agencyId}`);
  };

  const handleApproveClick = (agency: Agency, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovalModal({
      open: true,
      agency,
      action: 'approve'
    });
  };

  const handleRejectClick = (agency: Agency, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovalModal({
      open: true,
      agency,
      action: 'reject'
    });
  };

  const handleApprovalConfirm = async (message: string) => {
    if (!approvalModal.agency) return;

    setProcessing(approvalModal.agency._id);
    try {
      const endpoint = approvalModal.action === 'approve' ? '/api/agencies/approve' : '/api/agencies/reject';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyId: approvalModal.agency._id,
          message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the data
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/admin/agencies?${params.toString()}`);
        setApprovalModal({ open: false, agency: null, action: 'approve' });
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
            <h1 className="text-3xl font-bold text-foreground">Agencies Management</h1>
            <p className="text-muted-foreground mt-1">Review and manage real estate agencies</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agencies Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage real estate agencies</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-orange-400">{getStatusCount("PENDING")}</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-400">{getStatusCount("APPROVED")}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{getStatusCount("REJECTED")}</p>
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agencies</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalCount}</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agencies Table Card */}
      <Card className="bg-card border-border shadow-card hover:shadow-hover transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Agencies List</CardTitle>
              <CardDescription>Manage and review real estate agencies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                name="search"
                placeholder="Search agencies..."
                defaultValue={search}
                className="pl-10 bg-surface border-border focus:ring-2 focus:ring-purple-500/50"
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
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Agencies Table with Clickable Rows */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow className="bg-surface hover:bg-surface">
                  <TableHead className="font-semibold">Agency</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Registration</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies.map((agency: any) => (
                  <TableRow 
                    key={agency._id} 
                    className="clickable group"
                    onClick={() => handleRowClick(agency._id)}
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                            {agency.companyName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {agency.businessAddress?.city}, {agency.businessAddress?.state}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            License: {agency.licenseNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">
                            {agency.contactPerson?.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {agency.contactPerson?.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={agency.status.toLowerCase()} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-foreground">{agency.registrationNumber}</div>
                        <div className="text-muted-foreground text-xs">
                          {agency.businessType}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-foreground">{new Date(agency.createdAt).toLocaleDateString()}</div>
                        {agency.approvedAt && (
                          <div className="text-muted-foreground text-xs">
                            Approved: {new Date(agency.approvedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end">
                        {agency.status === "PENDING" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => handleApproveClick(agency, e)}
                              disabled={processing === agency._id}
                              className="bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400 hover:text-green-300 transition-all disabled:opacity-50"
                            >
                              {processing === agency._id ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => handleRejectClick(agency, e)}
                              disabled={processing === agency._id}
                              className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                            >
                              {processing === agency._id ? (
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
                              <Button variant="ghost" size="sm" className="hover:bg-purple-500/10 hover:text-purple-400">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/agencies/${agency._id}`} className="cursor-pointer hover:bg-blue-500/10">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {agency.status === "APPROVED" && (
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

          {agencies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No agencies found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || status !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No agencies have been registered yet'
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
                    router.push(`/admin/agencies?${params.toString()}`);
                  }}
                  className="hover:border-purple-500 hover:text-purple-400"
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
                    router.push(`/admin/agencies?${params.toString()}`);
                  }}
                  className="hover:border-purple-500 hover:text-purple-400"
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
        onClose={() => setApprovalModal({ open: false, agency: null, action: 'approve' })}
        onConfirm={handleApprovalConfirm}
        title={approvalModal.action === 'approve' ? 'Approve Agency' : 'Reject Agency'}
        description={
          approvalModal.action === 'approve' 
            ? `Approve ${approvalModal.agency?.companyName}'s application? They will be able to list properties on the platform.`
            : `Reject ${approvalModal.agency?.companyName}'s application? Please provide a reason for rejection.`
        }
        actionType={approvalModal.action}
        confirmButtonText={approvalModal.action === 'approve' ? 'Approve Agency' : 'Reject Agency'}
      />
    </div>
  );
}