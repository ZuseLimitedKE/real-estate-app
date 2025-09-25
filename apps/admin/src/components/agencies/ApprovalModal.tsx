'use client';

import { AgencyUser } from '@/lib/db/models/User';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { approveAgency, rejectAgency } from '@/lib/actions/agency-actions';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApprovalModalProps {
  agency: AgencyUser;
  action: 'approve' | 'reject';
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApprovalModal({
  agency,
  action,
  open,
  onClose,
  onSuccess
}: ApprovalModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve Agency' : 'Reject Agency';
  const description = isApprove 
    ? `Approve ${agency.companyName}'s application? They will be able to list properties on the platform.`
    : `Reject ${agency.companyName}'s application? Please provide a reason for rejection.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (isApprove) {
        result = await approveAgency(agency._id!.toString(), message);
      } else {
        if (!message.trim()) {
          setError('Rejection reason is required');
          setIsLoading(false);
          return;
        }
        result = await rejectAgency(agency._id!.toString(), message);
      }

      if (result.success) {
        onSuccess();
        setMessage('');
      } else {
        setError(result.error || 'Action failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-secondary-600">{description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              {isApprove ? 'Welcome Message (Optional)' : 'Rejection Reason *'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isApprove 
                  ? 'Add a welcome message for the agency...' 
                  : 'Explain why the application is being rejected...'
              }
              rows={4}
              required={!isApprove}
            />
            {!isApprove && (
              <p className="text-xs text-secondary-500">
                This message will be sent to the agency along with the rejection notification.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isApprove ? "default" : "destructive"}
              disabled={isLoading || (!isApprove && !message.trim())}
            >
              {isLoading ? 'Processing...' : title}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}