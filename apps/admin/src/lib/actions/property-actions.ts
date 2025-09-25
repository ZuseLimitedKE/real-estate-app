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