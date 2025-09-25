'use client';

import { Property } from '@/lib/db/models/Property';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { approveProperty, rejectProperty } from '@/lib/actions/property-actions';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PropertyApprovalModalProps {
  property: Property;
  action: 'approve' | 'reject';
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Render a modal dialog for approving or rejecting a property listing.
 *
 * @param property - The property being reviewed; used to display name and to identify the property for the action
 * @param action - Either `"approve"` or `"reject"` to determine modal copy, validation, and action behavior
 * @param open - Controls whether the modal is visible
 * @param onClose - Callback invoked to close the modal
 * @param onSuccess - Callback invoked after a successful approve or reject action
 * @returns A JSX element that renders the approval/rejection modal with input, validation, and action buttons
 */
export default function PropertyApprovalModal({
  property,
  action,
  open,
  onClose,
  onSuccess
}: PropertyApprovalModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve Property' : 'Reject Property';
  const description = isApprove 
    ? `Approve "${property.name}" for listing? This property will become visible to investors.`
    : `Reject "${property.name}" listing? Please provide a reason for rejection.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (isApprove) {
        result = await approveProperty(property._id!.toString(), message);
      } else {
        if (!message.trim()) {
          setError('Rejection reason is required');
          setIsLoading(false);
          return;
        }
        result = await rejectProperty(property._id!.toString(), message);
      }

      if (result.success) {
        onSuccess();
        setMessage('');
      } else {
        setError(result.error || 'Action failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('error:', err);
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
              {isApprove ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isApprove 
                  ? 'Add any notes about this approval...' 
                  : 'Explain why the property listing is being rejected...'
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