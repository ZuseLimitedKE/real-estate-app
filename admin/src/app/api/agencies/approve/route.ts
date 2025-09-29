// admin/src/app/api/agencies/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { approveAgency } from '@/lib/actions/agency-actions';

export async function POST(request: NextRequest) {
  try {
    const { agencyId, message } = await request.json();

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    const result = await approveAgency(agencyId, message);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Agency approved successfully' });
    } else {
      return NextResponse.json({ error: result.error || 'Failed to approve agency' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error approving agency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}