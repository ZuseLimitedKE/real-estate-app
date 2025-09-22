import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Eye, House, MapPin, Pencil, Percent, Plus, Trash, Users } from "lucide-react";
import AgentDashboardStatisticsItem from "./_components/agentDashboardStatistics";
import AgentDashboardProperties from "./_components/agentDashboardProperties";
import AgentDashboardTenants from "./_components/agentDashboardTenants";
import getDashboardProperties from "@/server-actions/agent/dashboard/getProperties";

export default async function AgentDashboard() {
    let properties = await getDashboardProperties(1);

    async function updatePropertiesPageNum(page: number) {
        properties = await getDashboardProperties(page)
    }

    return (
        <main>
            <header className="flex lg:flex-row flex-col lg:justify-between gap-4 my-4">
                <div>
                    <h1 className="text-2xl font-bold">Agent Dashboard</h1>
                    <p className="font-light text-slate-500">Manage your properties and track tenants</p>
                </div>

                <Button>
                    <Plus />
                    <p>Add New Property</p>
                </Button>
            </header>

            <article className="lg:grid lg:grid-cols-2 lg:gap-4 flex flex-col gap-3 mb-4">
                <AgentDashboardStatisticsItem
                    title="Total Earnings"
                    icon={<DollarSign className="w-4 h-4" />}
                    value="$125,000"
                />
                <AgentDashboardStatisticsItem
                    title="Occupancy Rate"
                    icon={<Percent className="w-4 h-4" />}
                    value="85%"
                />
                <AgentDashboardStatisticsItem
                    title="Total Properties"
                    icon={<House className="w-4 h-4" />}
                    value="12"
                />
                <AgentDashboardStatisticsItem
                    title="Active Tenants"
                    icon={<Users className="w-4 h-4" />}
                    value="23"
                />
            </article>

            <article>
                <div className="flex w-full flex-col gap-6">
                    <Tabs defaultValue="properties">
                        <TabsList>
                            <TabsTrigger value="properties">Properties</TabsTrigger>
                            <TabsTrigger value="tenants">Tenants</TabsTrigger>
                        </TabsList>
                        <TabsContent value="properties">
                            <AgentDashboardProperties properties={properties}/>
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
                </div>
            </article>
        </main>
    );
}
