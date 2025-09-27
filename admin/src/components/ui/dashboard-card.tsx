// admin/src/components/ui/dashboard-card.tsx
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBg?: string;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  icon,
  iconBg = "bg-primary/10",
  className,
}: DashboardCardProps) {
  // const changeColor = {
  //   positive: "text-green-500",
  //   negative: "text-red-500", 
  //   neutral: "text-muted-foreground",
  // };

  return (
    <Card className={cn(
      "bg-card border-border shadow-card hover:shadow-hover transition-all duration-300 group cursor-pointer",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">
              {value}
            </p>
            
          </div>
          {icon && (
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
              iconBg
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}