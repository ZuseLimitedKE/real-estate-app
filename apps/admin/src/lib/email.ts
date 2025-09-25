/**
 * Log an agency approval email payload for the given recipient.
 *
 * This is a mock implementation that logs the email details and does not actually send a message.
 *
 * @param email - Recipient email address
 * @param companyName - Name of the approved agency or company
 * @param welcomeMessage - Optional welcome message to include in the email
 */
export async function sendAgencyApprovalEmail(
  email: string,
  companyName: string,
  welcomeMessage?: string
): Promise<void> {
  console.log('Sending approval email to:', email);
  console.log('Company:', companyName);
  console.log('Welcome message:', welcomeMessage);
  
  // In production, integrate with:
  // - SendGrid
  // - AWS SES
  // - Nodemailer
  // - Resend
}

/**
 * Sends a rejection notification email to an agency applicant.
 *
 * @param email - Recipient email address
 * @param companyName - Name of the agency or company being notified
 * @param rejectionReason - Reason for the rejection to include in the message
 */
export async function sendAgencyRejectionEmail(
  email: string,
  companyName: string,
  rejectionReason: string
): Promise<void> {
  console.log('Sending rejection email to:', email);
  console.log('Company:', companyName);
  console.log('Rejection reason:', rejectionReason);
}

/**
 * Notify a recipient that a property has been approved by an agency.
 *
 * @param email - Recipient email address
 * @param propertyName - The approved property's name
 * @param agencyName - Name of the approving agency
 * @param approvalNotes - Optional additional notes to include in the approval message
 */
export async function sendPropertyApprovalEmail(
email: string, propertyName: string, agencyName: string, approvalNotes: string | undefined): Promise<void> {
  console.log('Sending property approval email to:', email);
  console.log('Property:', propertyName);
  console.log('Agency:', agencyName);
}

/**
 * Logs property rejection details for the given recipient to the console.
 *
 * @param email - Recipient email address
 * @param propertyName - Name of the rejected property
 * @param agencyName - Name of the agency associated with the property
 * @param rejectionReason - Reason provided for rejecting the property
 */
export async function sendPropertyRejectionEmail(
  email: string,
  propertyName: string,
  agencyName: string,
  rejectionReason: string
): Promise<void> {
  console.log('Sending property rejection email to:', email);
  console.log('Property:', propertyName);
  console.log('Agency:', agencyName);
  console.log('Rejection reason:', rejectionReason);
}