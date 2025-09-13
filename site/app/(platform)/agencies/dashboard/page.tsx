import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Eye, House, MapPin, Pencil, Percent, Plus, Trash, Users } from "lucide-react";

export default function AgentDashboard() {
    return (
        <main>
            <header>
                <h1>Agent Dashboard</h1>
                <p>Manage your properties and track tenants</p>
                <Button>
                    <Plus />
                    <p>Add New Property</p>
                </Button>
            </header>

            <article>
                <section>
                    <header>
                        <h3>Total Earnings</h3>
                        <DollarSign />
                    </header>
                    <p>$125,000</p>
                </section>
                <section>
                    <header>
                        <h3>Occupancy Rate</h3>
                        <Percent />
                    </header>
                    <p>85%</p>
                </section>
                <section>
                    <header>
                        <h3>Total Properties</h3>
                        <House />
                    </header>
                    <p>12</p>
                </section>
                <section>
                    <header>
                        <h3>Active Tenants</h3>
                        <Users />
                    </header>
                    <p>23</p>
                </section>
            </article>

            <article>
                <Tabs default="">
                    <TabsList>
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                        <TabsTrigger value="tenants">Tenants</TabsTrigger>
                    </TabsList>
                    <TabsContent value="properties">
                        <section>
                            <header>
                                <h2>My Properties</h2>
                                <p>3 properties</p>
                            </header>
                            <ul>
                                <li>
                                    <section>
                                        <header>
                                            <img
                                                src={"/public/modern-apartment-building-nairobi-westlands.jpg"}
                                                alt="Riverside Appartments image"
                                            />
                                            <p>Riverside Apartments</p>
                                            <p>Approved</p>
                                        </header>
                                        <p>
                                            <MapPin />
                                            <span>123 River Road, Westlands, Nairobi</span>
                                        </p>
                                        <p>
                                            <span>Type: Residential</span>
                                            <p>Residential</p>
                                        </p>
                                        <p>
                                            <span>Units: </span>
                                            <p>24</p>
                                        </p>
                                        <p>
                                            <span>Occupied: </span>
                                            <p>22/24</p>
                                        </p>
                                        <p>KSh 85,000/month</p>
                                        <footer>
                                            <Button>
                                                <Eye />
                                                <p>View</p>
                                            </Button>
                                            <Button>
                                                <Pencil />
                                                <p>Edit</p>
                                            </Button>
                                            <Button>
                                                <Trash />
                                                <p>Delete</p>
                                            </Button>
                                        </footer>
                                    </section>
                                </li>
                            </ul>
                        </section>
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