/* eslint-disable @typescript-eslint/no-explicit-any */
// admin/src/app/api/agencies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models/User';
import { serializeDocuments } from '@/lib/utils/serialization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const rawPage = Number(searchParams.get('page') || '1');
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = 10;

    let agencies = [];
    let totalCount = 0;

    if (status === "all") {
      agencies = await UserModel.findByRole("AGENCY", limit, (page - 1) * limit);
      totalCount = await UserModel.countAgencies();
    } else {
      const normalized = status.toUpperCase() as any;
      agencies = await UserModel.findAgenciesByStatus(normalized, limit, (page - 1) * limit);
      const stats = await UserModel.getAgencyStats();
      const match = stats.find((s: any) => s._id === normalized);
      totalCount = match?.count ?? 0;
    }

    // Filter by search if provided
    if (search) {
      agencies = agencies.filter((agency: any) =>
        agency.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        agency.contactPerson?.email?.toLowerCase().includes(search.toLowerCase()) ||
        agency.licenseNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const agencyStats = await UserModel.getAgencyStats();

    return NextResponse.json({
      agencies: serializeDocuments(agencies),
      stats: {
        totalCount,
        agencyStats: serializeDocuments(agencyStats),
        totalPages: Math.max(1, Math.ceil(totalCount / limit))
      }
    });
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}