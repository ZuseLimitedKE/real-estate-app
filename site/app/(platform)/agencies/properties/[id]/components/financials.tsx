import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SinglePropertyFinances } from "@/types/agent_dashboard";

export default function PropertyFinancials(props: {
  finances: SinglePropertyFinances;
}) {
  return (
    <div className="space-y-8">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Investment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <span className="text-muted-foreground font-medium text-lg">
                Property Value
              </span>
              <span className="text-2xl font-bold text-foreground">
                Ksh {props.finances.propertyValue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <span className="text-muted-foreground font-medium text-lg">
                Expected Yield
              </span>
              <span className="text-2xl font-bold text-success">
                {props.finances.expectedYield.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-muted-foreground font-medium text-lg">
                Investment Period
              </span>
              <span className="text-2xl font-bold text-foreground">
                5 Years
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <span className="text-muted-foreground font-medium text-lg">
                Monthly Revenue
              </span>
              <span className="text-2xl font-bold text-primary">
                Ksh {props.finances.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <span className="text-muted-foreground font-medium text-lg">
                Annual Revenue
              </span>
              <span className="text-2xl font-bold text-primary">
                Ksh {props.finances.annualRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-4">
              <span className="text-muted-foreground font-medium text-lg">
                ROI
              </span>
              <span className="text-2xl font-bold text-success">
                {props.finances.roi.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
