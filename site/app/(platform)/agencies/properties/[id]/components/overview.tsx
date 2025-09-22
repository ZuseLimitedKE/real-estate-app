import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPropertyOverview, AMENITIES } from "@/types/agent_dashboard";
import { Car, Dumbbell, Waves, Wifi } from "lucide-react";

export default function PropertyOverview(props: { overview: AgentPropertyOverview }) {
    const amenitiesUI = props.overview.amenities.map((amenity, index) => (
        <div key={index}>
            {getUIForAmenity(amenity)}
        </div>
    ));

    return (
        <section className="my-4 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold">Property Details</h2>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <p>
                        <span className="font-bold">Type: </span>
                        <span>{props.overview.propertyDetails.type}</span>
                    </p>

                    <p>
                        <span className="font-bold">Size: </span>
                        <span>{props.overview.propertyDetails.size} sqft</span>
                    </p>

                    {props.overview.propertyDetails.units && (
                        <p>
                            <span className="font-bold">Units: </span>
                            <span>{props.overview.propertyDetails.units}</span>
                        </p>
                    )}

                    {props.overview.propertyDetails.floors && (
                        <p>
                            <span className="font-bold">Floors: </span>
                            <span>{props.overview.propertyDetails.floors}</span>
                        </p>
                    )}

                    {props.overview.propertyDetails.parkingSpace && (
                        <p>
                            <span className="font-bold">Parking Spaces: </span>
                            <span>{props.overview.propertyDetails.parkingSpace}</span>
                        </p>
                    )}

                    <p>
                        <span className="font-bold">Year Built: </span>
                        <span>{props.overview.propertyDetails.createdAt.getFullYear()}</span>
                    </p>
                </CardContent>
            </Card>

            {props.overview.occupancy && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-bold">Occupancy & Revenue</h2>
                    </CardHeader>
                    <CardContent>
                        <p className="flex flex-row justify-between">
                            <span>Occupied Units: </span>
                            <span className="font-bold">{props.overview.occupancy.occupied}/{props.overview.occupancy.totalUnits}</span>
                        </p>

                        <p className="flex flex-row justify-between">
                            <span>Occupancy Rate: </span>
                            <span className="font-bold">{props.overview.occupancy.rate}%</span>
                        </p>

                        <p className="flex flex-row justify-between">
                            <span>Monthly Revenue: </span>
                            <span className="font-bold">Ksh {props.overview.occupancy.monthlyRevenue}</span>
                        </p>
                    </CardContent>
                </Card>
            )}


            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold">About This Property</h2>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500">{props.overview.about}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2>Amenities</h2>
                </CardHeader>
                <CardContent className="flex flex-row gap-4 flex-wrap lg:justify-around">
                    {amenitiesUI}
                </CardContent>
            </Card>
        </section>
    );
}

function getUIForAmenity(amenity: AMENITIES) {
    switch (amenity) {
        case (AMENITIES.FITNESS):
            return (
                <div className="flex flex-row gap-2 items-center text-primary">
                    <Dumbbell className="w-4 h-4" />
                    <p>Fitness Center</p>
                </div>
            );
        case (AMENITIES.PARKING):
            return (
                <div className="flex flex-row gap-2 items-center text-primary">
                    <Car className="w-4 h-4" />
                    <p>Parking</p>
                </div>
            );
        case (AMENITIES.SWIMMING):
            return (
                <div className="flex flex-row gap-2 items-center text-primary">
                    <Waves className="w-4 h-4" />
                    <p>Swimming Pool</p>
                </div>
            );
        case (AMENITIES.WIFI):
            return (
                <div className="flex flex-row gap-2 items-center text-primary">
                    <Wifi className="w-4 h-4" />
                    <p>WiFi</p>
                </div>
            );
        default:
            return (<div></div>);
    }
}