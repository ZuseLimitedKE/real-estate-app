import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AgentPropertyOverview, AMENITIES } from "@/types/agent_dashboard";
import {
  Box,
  Camera,
  Car,
  ChevronUp,
  Dog,
  Dumbbell,
  FireExtinguisher,
  Flower,
  Heater,
  Shirt,
  Snowflake,
  LucideDroplet as SoapDispenserDroplet,
  Waves,
} from "lucide-react";

export default function PropertyOverview(props: {
  overview: AgentPropertyOverview;
}) {
  const amenitiesUI = props.overview.amenities.map((amenity, index) => (
    <div key={index}>{getUIForAmenity(amenity)}</div>
  ));

  return (
    <div className="space-y-8">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Type
              </span>
              <p className="text-lg font-semibold text-foreground">
                {props.overview.propertyDetails.type}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Size
              </span>
              <p className="text-lg font-semibold text-foreground">
                {props.overview.propertyDetails.size} sqft
              </p>
            </div>

            {props.overview.propertyDetails.units && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Units
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {props.overview.propertyDetails.units}
                </p>
              </div>
            )}

            {props.overview.propertyDetails.floors && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Floors
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {props.overview.propertyDetails.floors}
                </p>
              </div>
            )}

            {props.overview.propertyDetails.parkingSpace && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Parking Spaces
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {props.overview.propertyDetails.parkingSpace}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Year Built
              </span>
              <p className="text-lg font-semibold text-foreground">
                {props.overview.propertyDetails.createdAt.getFullYear()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {props.overview.occupancy && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">
              Occupancy & Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground font-medium">
                  Occupied Units
                </span>
                <span className="text-xl font-bold text-foreground">
                  {props.overview.occupancy.occupied}/
                  {props.overview.occupancy.totalUnits}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-muted-foreground font-medium">
                  Occupancy Rate
                </span>
                <span className="text-xl font-bold text-success">
                  {props.overview.occupancy.rate}%
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground font-medium">
                  Monthly Revenue
                </span>
                <span className="text-xl font-bold text-primary">
                  Ksh {props.overview.occupancy.monthlyRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            About This Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {props.overview.about}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">
            Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenitiesUI}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getUIForAmenity(amenity: AMENITIES) {
  const baseClasses =
    "flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md";
  const iconClasses = "w-5 h-5 text-slate-600 flex-shrink-0";
  const textClasses = "font-medium text-slate-800 text-sm";

  switch (amenity) {
    case AMENITIES.FITNESS:
      return (
        <div className={baseClasses}>
          <Dumbbell className={iconClasses} />
          <p className={textClasses}>Fitness Center</p>
        </div>
      );
    case AMENITIES.PARKING:
      return (
        <div className={baseClasses}>
          <Car className={iconClasses} />
          <p className={textClasses}>Parking</p>
        </div>
      );
    case AMENITIES.SWIMMING:
      return (
        <div className={baseClasses}>
          <Waves className={iconClasses} />
          <p className={textClasses}>Swimming Pool</p>
        </div>
      );
    case AMENITIES.AIR_CONDITIONING:
      return (
        <div className={baseClasses}>
          <Snowflake className={iconClasses} />
          <p className={textClasses}>Air Conditioning</p>
        </div>
      );
    case AMENITIES.HEATING:
      return (
        <div className={baseClasses}>
          <Heater className={iconClasses} />
          <p className={textClasses}>Heating</p>
        </div>
      );
    case AMENITIES.LAUNDRY:
      return (
        <div className={baseClasses}>
          <Shirt className={iconClasses} />
          <p className={textClasses}>Laundry In Unit</p>
        </div>
      );
    case AMENITIES.DISHWASHER:
      return (
        <div className={baseClasses}>
          <SoapDispenserDroplet className={iconClasses} />
          <p className={textClasses}>Dishwasher</p>
        </div>
      );
    case AMENITIES.FIREPLACE:
      return (
        <div className={baseClasses}>
          <FireExtinguisher className={iconClasses} />
          <p className={textClasses}>Fireplace</p>
        </div>
      );
    case AMENITIES.STORAGE:
      return (
        <div className={baseClasses}>
          <Box className={iconClasses} />
          <p className={textClasses}>Storage</p>
        </div>
      );
    case AMENITIES.PET_FRIENDLY:
      return (
        <div className={baseClasses}>
          <Dog className={iconClasses} />
          <p className={textClasses}>Pet Friendly</p>
        </div>
      );
    case AMENITIES.SECURITY:
      return (
        <div className={baseClasses}>
          <Camera className={iconClasses} />
          <p className={textClasses}>Security System</p>
        </div>
      );
    case AMENITIES.ELEVATOR:
      return (
        <div className={baseClasses}>
          <ChevronUp className={iconClasses} />
          <p className={textClasses}>Elevator</p>
        </div>
      );
    case AMENITIES.GARDEN:
      return (
        <div className={baseClasses}>
          <Flower className={iconClasses} />
          <p className={textClasses}>Garden Yard</p>
        </div>
      );
    default:
      return <div></div>;
  }
}
