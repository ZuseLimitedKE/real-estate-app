import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Car, Dumbbell, Waves, Wifi } from "lucide-react";

export default function PropertyOverview() {
    return (
        <section className="my-4 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <h2>Property Details</h2>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <p>
                        <span>Type: </span>
                        <span>Residential</span>
                    </p>

                    <p>
                        <span>Size: </span>
                        <span>2500 sqft</span>
                    </p>

                    <p>
                        <span>Units: </span>
                        <span>24</span>
                    </p>

                    <p>
                        <span>Floors: </span>
                        <span>6</span>
                    </p>

                    <p>
                        <span>Parking Spaces: </span>
                        <span>30</span>
                    </p>

                    <p>
                        <span>Year Built: </span>
                        <span>2000</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2>Occupancy & Revenue</h2>
                </CardHeader>
                <CardContent>
                    <p className="flex flex-row justify-between">
                        <span>Occupied Units: </span>
                        <span>22/24</span>
                    </p>

                    <p className="flex flex-row justify-between">
                        <span>Occupancy Rate: </span>
                        <span>92%</span>
                    </p>

                    <p className="flex flex-row justify-between">
                        <span>Monthly Revenue: </span>
                        <span>Ksh 85,000</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2>About This Property</h2>
                </CardHeader>
                <CardContent>
                    <p>Modern residential complex featuring contemporary design and premium amenities. Located in the heart of Westlands with easy access to shopping centers, restaurants, and business districts.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2>Amenities</h2>
                </CardHeader>
                <CardContent className="flex flex-row gap-4 flex-wrap">
                    <div className="flex flex-row gap-2 items-center">
                        <Wifi className="w-4 h-4"/>
                        <p>WiFi</p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Car className="w-4 h-4"/>
                        <p>Parking</p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Waves className="w-4 h-4"/>
                        <p>Swimming Pool</p>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <Dumbbell className="w-4 h-4"/>
                        <p>Fitness Center</p>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}