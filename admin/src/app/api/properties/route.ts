/* eslint-disable @typescript-eslint/no-explicit-any */
// admin/src/app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PropertyModel } from '@/lib/db/models/Property';
import { serializeDocuments } from '@/lib/utils/serialization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;

    let properties = [];
    let totalCount = 0;

    if (status === 'all') {
      properties = await PropertyModel.findByStatus('approved', limit, (page - 1) * limit);
      totalCount = await PropertyModel.countProperties();
    } else {
      properties = await PropertyModel.findByStatus(status as any, limit, (page - 1) * limit);
      const propertyStats = await PropertyModel.getPropertyStats();
      const match = propertyStats.find((s: any) => s._id === status);
      totalCount = match?.count || 0;
    }

    // Filter by search if provided
    if (search) {
      properties = properties.filter((property: any) =>
        property.name?.toLowerCase().includes(search.toLowerCase()) ||
        property.location?.address?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const propertyStats = await PropertyModel.getPropertyStats();

    return NextResponse.json({
      properties: serializeDocuments(properties),
      stats: {
        totalCount,
        propertyStats: serializeDocuments(propertyStats),
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}