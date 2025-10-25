import getPropertyFromID from "@/server-actions/agent/dashboard/getPropertyFromID";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SinglePropertyDetails from "./components/singleProperty";
import ApartmentPropertyDetails from "./components/apartmentProperty";

export default async function AgentPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyFromID(id);

  if (!property) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Property Not Found
            </h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              The property you selected either does not exist or is not owned by
              your agency.
            </p>
            <p className="text-muted-foreground">
              Please go back to your dashboard page to select an existing
              property
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (property.single_property) {
    return <SinglePropertyDetails {...property.single_property} />;
  } else if (property.apartment_property) {
    return <ApartmentPropertyDetails {...property.apartment_property} />;
  } else {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Invalid property
            </h1>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              The property that you have selected has either had data entered
              into it incorrectly or has been corrupted
            </p>
            <p className="text-muted-foreground">Please contact support</p>
          </CardContent>
        </Card>
      </main>
    );
  }
}
