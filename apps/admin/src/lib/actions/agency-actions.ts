'use server';

import { UserModel } from '@/lib/db/models/User';
import { auth } from '@/lib/auth';
import { sendAgencyApprovalEmail, sendAgencyRejectionEmail } from '@/lib/email';

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Approves a pending agency and sends an approval email.
 *
 * @param agencyId - The ID of the agency to approve
 * @param welcomeMessage - Optional custom welcome message to include in the approval email
 * @returns An ActionResult with `success: true` and a confirmation `message` when the agency is approved; otherwise `success: false` and an `error` explaining the failure (e.g., not authenticated, agency not found, invalid status, update failure, or other errors).
 */
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

/**
 * Rejects an agency application, updates its status to "REJECTED", and notifies the agency by email.
 *
 * @param agencyId - ID of the agency to reject
 * @param rejectionReason - Reason for rejection included in the audit record and in the notification email
 * @returns An ActionResult: `success` true and a confirmation `message` on success; `success` false and an `error` message on failure
 */
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

/**
 * Suspend an agency by setting its status to "SUSPENDED" and recording the provided reason.
 *
 * @param agencyId - The identifier of the agency to suspend
 * @param reason - The reason for suspension to record with the status update
 * @returns An ActionResult: on success `success: true` with a confirmation `message`; on failure `success: false` with an `error` describing the failure
 */
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

/**
 * Reactivates an agency by setting its status to "APPROVED".
 *
 * @param agencyId - The ID of the agency user to reactivate
 * @returns An ActionResult: `success` is `true` and `message` contains a confirmation when reactivation succeeds; `success` is `false` and `error` contains a reason on failure.
 */
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