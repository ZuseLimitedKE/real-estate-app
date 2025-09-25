'use server';

import { PropertyModel } from '@/lib/db/models/Property';
import { UserModel } from '@/lib/db/models/User';
import { auth } from '@/lib/auth';
import { sendPropertyApprovalEmail, sendPropertyRejectionEmail } from '@/lib/email';

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Approves a pending property and notifies its agency when available.
 *
 * Updates the property's status to `approved` and, if the property's agency exists and has role `AGENCY`, sends an approval email that may include optional notes.
 *
 * @param propertyId - The identifier of the property to approve
 * @param approvalNotes - Optional notes to include in the approval email sent to the agency
 * @returns `true` when the property was approved (and notification sent when applicable); `false` otherwise, with `error` containing the failure reason
 */
export async function approveProperty(propertyId: string, approvalNotes?: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    if (property.property_status !== 'pending') {
      return { success: false, error: 'Property is not in pending status' };
    }

    const success = await PropertyModel.updateStatus(propertyId, 'approved');
    if (!success) {
      return { success: false, error: 'Failed to update property status' };
    }

    // Get agency details to send email
    const agency = await UserModel.findById(property.agencyId);
    if (agency && agency.role === 'AGENCY') {
      await sendPropertyApprovalEmail(
        agency.email,
        property.name,
        agency.companyName,
        approvalNotes
      );
    }

    return { 
      success: true, 
      message: `Property "${property.name}" has been approved successfully.` 
    };
  } catch (error) {
    console.error('Property approval error:', error);
    return { success: false, error: 'Failed to approve property' };
  }
}

/**
 * Rejects a property by updating its status to "rejected" and notifies the property's agency if available.
 *
 * @param propertyId - The identifier of the property to reject
 * @param rejectionReason - The reason for rejecting the property; included in the agency notification
 * @returns An ActionResult where `success` is `true` if the property was rejected (and notification sent when applicable), `false` otherwise. On success `message` contains a confirmation with the property name; on failure `error` contains a short failure reason.
 */
export async function rejectProperty(propertyId: string, rejectionReason: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const success = await PropertyModel.updateStatus(propertyId, 'rejected');
    if (!success) {
      return { success: false, error: 'Failed to update property status' };
    }

    // Get agency details to send email
    const agency = await UserModel.findById(property.agencyId);
    if (agency && agency.role === 'AGENCY') {
      await sendPropertyRejectionEmail(
        agency.email,
        property.name,
        agency.companyName,
        rejectionReason
      );
    }

    return { 
      success: true, 
      message: `Property "${property.name}" has been rejected.` 
    };
  } catch (error) {
    console.error('Property rejection error:', error);
    return { success: false, error: 'Failed to reject property' };
  }
}

/**
 * Suspend a property by updating its status to indicate suspension.
 *
 * @param propertyId - The identifier of the property to suspend
 * @param reason - The reason for suspending the property
 * @returns An ActionResult: `success: true` and a message containing the property's name when suspension succeeds; otherwise `success: false` with an `error` string
 */
export async function suspendProperty(propertyId: string, reason: string): Promise<ActionResult> {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    // For suspension, we might want to create a separate status or field
    // For now, we'll use rejected status for suspension
    const success = await PropertyModel.updateStatus(propertyId, 'rejected');
    if (!success) {
      return { success: false, error: 'Failed to suspend property' };
    }

    return { 
      success: true, 
      message: `Property "${property.name}" has been suspended.` 
    };
  } catch (error) {
    console.error('Property suspension error:', error);
    return { success: false, error: 'Failed to suspend property' };
  }
}

/**
 * Reactivates a property by setting its status to `approved`.
 *
 * @returns `ActionResult` with `success: true` and a confirmation `message` when reactivation succeeds; otherwise `success: false` with an `error` describing the failure.
 */
export async function reactivateProperty(propertyId: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    const success = await PropertyModel.updateStatus(propertyId, 'approved');
    if (!success) {
      return { success: false, error: 'Failed to reactivate property' };
    }

    return { 
      success: true, 
      message: `Property "${property.name}" has been reactivated.` 
    };
  } catch (error) {
    console.error('Property reactivation error:', error);
    return { success: false, error: 'Failed to reactivate property' };
  }
}