// admin/src/components/ui/status-badge.tsx
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const config = {
      pending: {
        label: "Pending",
        class: "status-pending"
      },
      approved: {
        label: "Approved", 
        class: "status-approved"
      },
      rejected: {
        label: "Rejected",
        class: "status-rejected"
      },
      suspended: {
        label: "Suspended",
        class: "status-rejected"
      }
    };

    return config[status as keyof typeof config] || config.pending;
  };

  const config = getStatusConfig(status);

  return (
    <span className={cn("status-badge", config.class, className)}>
      {config.label}
    </span>
  );
}