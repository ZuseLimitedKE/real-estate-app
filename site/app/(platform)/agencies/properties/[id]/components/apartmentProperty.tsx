import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentProperty } from "@/types/agent_dashboard";
import { Edit, MapPin } from "lucide-react";
import PropertyDocuments from "./documents";
import ApartmentTemplateView from "./apartmentPropertyTemplate";
import Link from "next/link";


export default function ApartmentPropertyDetails(props: AgentProperty['apartment_property']) {
    if (!props) {
        return (<div></div>);
    }

    return (
        <main className="container mx-auto px-4 py-8 space-y-8">
            <header className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-foreground">
                                {props.name}
                            </h1>
                            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                                {props.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-5 h-5" />
                            <span className="text-lg">{props.address}</span>
                        </div>
                    </div>

                    <Link
                        href={`/agencies/properties/${props.id}/edit`}
                        className="flex items-center gap-2"
                    >
                        <Button size="lg" className="lg:w-auto w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Property
                        </Button>
                    </Link>
                </div>
            </header>

            {/* About the property and some statistics */}
            <section className="space-y-8">
                <p className="text-muted-foreground leading-relaxed text-lg">
                    {props.about}
                </p>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-12">
                        <TabsTrigger value="overview" className="text-sm font-medium">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="text-sm font-medium">
                            Documents
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-8">
                        <TabsContent value="overview" className="mt-0">
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
                                                apartment
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                                Year Built
                                            </span>
                                            <p className="text-lg font-semibold text-foreground">
                                                {props.createdAt.getFullYear()}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                                Number of tenants
                                            </span>
                                            <p className="text-lg font-semibold text-foreground">
                                                {props.numTenants}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                                Occupancy Rate
                                            </span>
                                            <p className="text-lg font-semibold text-foreground">
                                                {props.occupancyRate.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-0">
                            <PropertyDocuments documents={props.documents} />
                        </TabsContent>
                    </div>
                </Tabs>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Unit Templates
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <ul className="space-y-3">
                            {props.unitTemplates.map((template, index) => (
                                <li key={index}>
                                    <ApartmentTemplateView template={template} propertyid={props.id}/>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </section>
        </main>
    )
}