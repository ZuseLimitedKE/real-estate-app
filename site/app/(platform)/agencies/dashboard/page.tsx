import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Eye, House, MapPin, Pencil, Percent, Plus, Trash, Users } from "lucide-react";
import AgentDashboardStatisticsItem from "./_components/agentDashboardStatistics";
import AgenetDashboardProperties from "./_components/agentDashboardProperties";
import AgentDashboardTenants from "./_components/agentDashboardTenants";

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
                        <AgentDashboardTenants
                            tenants={[
                                {
                                    name: "John Doe",
                                    property: "Riverside Appartments - Unit 12A",
                                    rent: 35000,
                                    status: "active",
                                    contactInfo: {
                                        email: "john.doe@email.com",
                                        number: "+254 722001144"
                                    },
                                    leaseInfo: {
                                        property: "123 River Road, Westlands, Nairobi",
                                        initialDate: new Date('09/10/2021')
                                    },
                                    paymentHistory: [
                                        {
                                            date: new Date('09/10/2021'),
                                            amount: 35000,
                                            status: 'active'
                                        },
                                        {
                                            date: new Date('09/11/2021'),
                                            amount: 35000,
                                            status: 'active'
                                        },
                                    ]
                                },

                                {
                                    name: "Sarah Wilson",
                                    property: "Commercial Plaza - Shop 5",
                                    rent: 80000,
                                    status: "active",
                                    contactInfo: {
                                        email: "sarah.wilson@email.com",
                                        number: "+254 722211144"
                                    },
                                    leaseInfo: {
                                        property: "456 Business Ave, CBD, Nairobi",
                                        initialDate: new Date('09/12/2023')
                                    },
                                    paymentHistory: [
                                        {
                                            date: new Date('09/12/2022'),
                                            amount: 80000,
                                            status: 'active'
                                        },
                                        {
                                            date: new Date('09/01/2022'),
                                            amount: 80000,
                                            status: 'active'
                                        },
                                    ]
                                },
                            ]}

                        />
                    </TabsContent>
                </Tabs>
            </article>
        </main>
    );
}
