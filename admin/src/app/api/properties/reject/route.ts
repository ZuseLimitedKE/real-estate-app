// admin/src/app/api/properties/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rejectProperty } from '@/lib/actions/property-actions';

export async function POST(request: NextRequest) {
  try {
    const { propertyId, message } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const result = await rejectProperty(propertyId, message);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Property rejected successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to reject property' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error rejecting property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}