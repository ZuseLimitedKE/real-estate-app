// Mock email service - replace with actual email service in production
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

export async function sendAgencyRejectionEmail(
  email: string,
  companyName: string,
  rejectionReason: string
): Promise<void> {
  console.log('Sending rejection email to:', email);
  console.log('Company:', companyName);
  console.log('Rejection reason:', rejectionReason);
}

export async function sendPropertyApprovalEmail(
email: string, propertyName: string, agencyName: string, approvalNotes: string | undefined): Promise<void> {
  console.log('Sending property approval email to:', email);
  console.log('Property:', propertyName);
  console.log('Agency:', agencyName);
}

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