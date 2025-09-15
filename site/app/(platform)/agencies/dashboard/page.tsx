import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Eye, House, MapPin, Pencil, Percent, Plus, Trash, Users } from "lucide-react";
import AgentDashboardStatisticsItem from "./_components/agentDashboardStatistics";
import AgenetDashboardProperties from "./_components/agentDashboardProperties";

export default function AgentDashboard() {
    return (
        <main>
            <header className="flex lg:flex-row flex-col lg:justify-between gap-4 my-4">
                <div>
                    <h1>Agent Dashboard</h1>
                    <p>Manage your properties and track tenants</p>
                </div>

                <Button>
                    <Plus />
                    <p>Add New Property</p>
                </Button>
            </header>

            <article className="lg:grid lg:grid-cols-2 lg:gap-4">
                <AgentDashboardStatisticsItem 
                    title="Total Earnings"
                    icon={<DollarSign />}
                    value="$125,000"
                />
                <AgentDashboardStatisticsItem 
                    title="Occupancy Rate"
                    icon={<Percent />}
                    value="85%"
                />
                <AgentDashboardStatisticsItem 
                    title="Total Properties"
                    icon={<House />}
                    value="12"
                />
                <AgentDashboardStatisticsItem 
                    title="Active Tenants"
                    icon={<Users />}
                    value="23"
                />
            </article>

            <article>
                <Tabs defaultValue="properties">
                    <TabsList>
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                        <TabsTrigger value="tenants">Tenants</TabsTrigger>
                    </TabsList>
                    <TabsContent value="properties">
                        <AgenetDashboardProperties 
                            properties={[
                                {
                                    id: "test",
                                    status: "approved",
                                    image: "/modern-apartment-building-nairobi-westlands.jpg",
                                    name: "Riverside Apartments",
                                    location: "123 River Road, Westlands, Nairobi",
                                    details: [
                                        {
                                            title: "Type",
                                            value: "Residential"
                                        },
                                        {
                                            title: "Units",
                                            value: "24"
                                        },
                                        {
                                            title: "Occupied",
                                            value: "22/24"
                                        },
                                    ],
                                    rent: 85000

                                },
                                {
                                    id: "test_2",
                                    status: "reviewing",
                                    image: "/waterfront-apartment-development-mombasa-nyali.jpg",
                                    name: "Mombasa Waterfront Properties",
                                    location: "123 Nyali Drive, Nyali, Mombasa",
                                    details: [
                                        {
                                            title: "Type",
                                            value: "Mansionnete"
                                        },
                                    ],
                                    rent: 150000

                                },
                            ]}
                        />
                    </TabsContent>
                    <TabsContent value="tenants">
                        <section>
                            <header>
                                <h2>Tenant Managmement</h2>
                                <p>3 active tenants</p>
                            </header>
                            <ul>
                                <li>
                                    <section>
                                        <p>John Doe</p>
                                        <p>
                                            <span><MapPin /></span>
                                            Riverside Apartments- Unit 12A
                                        </p>
                                        <p>Ksh 35,000/month</p>
                                        <p>active</p>
                                    </section>
                                </li>
                                <li>
                                    <section>
                                        <p>John Doe</p>
                                        <p>
                                            <span><MapPin /></span>
                                            Riverside Apartments- Unit 12A
                                        </p>
                                        <p>Ksh 35,000/month</p>
                                        <p>active</p>
                                    </section>
                                </li>
                                <li>
                                    <section>
                                        <p>John Doe</p>
                                        <p>
                                            <span><MapPin /></span>
                                            Riverside Apartments- Unit 12A
                                        </p>
                                        <p>Ksh 35,000/month</p>
                                        <p>active</p>
                                    </section>
                                </li>
                            </ul>
                        </section>
                    </TabsContent>
                </Tabs>
            </article>
        </main>
    );
}
