// admin/src/app/api/agencies/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rejectAgency } from '@/lib/actions/agency-actions';

export async function POST(request: NextRequest) {
  try {
    const { agencyId, message } = await request.json();

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    const result = await rejectAgency(agencyId, message);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Agency rejected successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to reject agency' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error rejecting agency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}