/* eslint-disable @typescript-eslint/no-explicit-any */
// admin/src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models/User';
import { serializeDocuments } from '@/lib/utils/serialization';

export async function GET(request: NextRequest) {
  try {
    const [investors, agencies, admins] = await Promise.all([
      UserModel.findByRole('INVESTOR'),
      UserModel.findByRole('AGENCY'), 
      UserModel.findByRole('ADMIN')
    ]);

    const allUsers = [...investors, ...agencies, ...admins];

    return NextResponse.json({
      users: serializeDocuments(allUsers),
      stats: {
        totalUsers: allUsers.length,
        activeInvestors: investors.filter((u: any) => u.status === 'APPROVED').length,
        approvedAgencies: agencies.filter((u: any) => u.status === 'APPROVED').length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}