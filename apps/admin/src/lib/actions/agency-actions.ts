'use server';

import { UserModel } from '@/lib/db/models/User';
import { auth } from '@/lib/auth';
import { sendAgencyApprovalEmail, sendAgencyRejectionEmail } from '@/lib/email';

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function approveAgency(agencyId: string, welcomeMessage?: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== 'AGENCY') {
      return { success: false, error: 'Agency not found' };
    }

    if (agency.status !== 'PENDING') {
      return { success: false, error: 'Agency is not in pending status' };
    }

    const success = await UserModel.updateStatus(agencyId, 'APPROVED', session.user.email);
    if (!success) {
      return { success: false, error: 'Failed to update agency status' };
    }

    // Send approval email
    await sendAgencyApprovalEmail(
      agency.email,
      agency.companyName,
      welcomeMessage
    );

    return { 
      success: true, 
      message: `Agency "${agency.companyName}" has been approved successfully.` 
    };
  } catch (error) {
    console.error('Agency approval error:', error);
    return { success: false, error: 'Failed to approve agency' };
  }
}

export async function rejectAgency(agencyId: string, rejectionReason: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
  
    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== 'AGENCY') {
      return { success: false, error: 'Agency not found' };
    }

    const success = await UserModel.updateStatus(
      agencyId, 
      'REJECTED', 
      session.user.email, 
      rejectionReason
    );

    if (!success) {
      return { success: false, error: 'Failed to update agency status' };
    }

    // Send rejection email
    await sendAgencyRejectionEmail(
      agency.email,
      agency.companyName,
      rejectionReason
    );

    return { 
      success: true, 
      message: `Agency "${agency.companyName}" has been rejected.` 
    };
  } catch (error) {
    console.error('Agency rejection error:', error);
    return { success: false, error: 'Failed to reject agency' };
  }
}

export async function suspendAgency(agencyId: string, reason: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== 'AGENCY') {
      return { success: false, error: 'Agency not found' };
    }

    const success = await UserModel.updateStatus(
      agencyId, 
      'SUSPENDED', 
      session.user.email, 
      reason
    );

    if (!success) {
      return { success: false, error: 'Failed to suspend agency' };
    }

    return { 
      success: true, 
      message: `Agency "${agency.companyName}" has been suspended.` 
    };
  } catch (error) {
    console.error('Agency suspension error:', error);
    return { success: false, error: 'Failed to suspend agency' };
  }
}

export async function reactivateAgency(agencyId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== 'AGENCY') {
      return { success: false, error: 'Agency not found' };
    }

    const success = await UserModel.updateStatus(agencyId, 'APPROVED', session.user.email);
    if (!success) {
      return { success: false, error: 'Failed to reactivate agency' };
    }

    return { 
      success: true, 
      message: `Agency "${agency.companyName}" has been reactivated.` 
    };
  } catch (error) {
    console.error('Agency reactivation error:', error);
    return { success: false, error: 'Failed to reactivate agency' };
  }
}