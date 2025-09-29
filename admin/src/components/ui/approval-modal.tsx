// admin/src/components/ui/approval-modal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => Promise<void>;
  title: string;
  description: string;
  actionType: 'approve' | 'reject';
  confirmButtonText: string;
}

export function ApprovalModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  actionType,
  confirmButtonText
}: ApprovalModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isApprove = actionType === 'approve';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onConfirm(message);
      setMessage('');
      onClose();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Approval error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="bg-surface border-border focus:border-primary"
            />
            {!isApprove && (
              <p className="text-xs text-muted-foreground">
                This message will be sent to the agency along with the rejection notification.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="hover:border-gray-500 hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (!isApprove && !message.trim())}
              className={
                isApprove 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isApprove ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Processing...' : confirmButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}