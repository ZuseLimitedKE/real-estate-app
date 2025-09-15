import { Button } from "@/components/ui/button";
import { Eye, MapPin, Pencil, Trash } from "lucide-react";

interface DashboardProperties {
    id: string,
    image: string,
    name: string,
    status: string,
    location: string,
    details: {
        title: string,
        value: string
    }[],
    rent: number,
}

export default function AgenetDashboardProperties(props: { properties: DashboardProperties[] }) {
    const propertiesListItems = props.properties.map((p) => {
        const detailItems = p.details.map((d, index) => (
            <p key={index}>
                <span>{d.title}: </span>
                <span>{d.value}</span>
            </p>
        ));

        return (
            <li key={p.id}>
                <section className="flex flex-col gap-2">
                    <header>
                        <img
                            src={p.image}
                            alt={p.name}
                        />
                        <div className="flex flex-row gap-2 flex-wrap">
                            <p>{p.name}</p>
                            <p>{p.status}</p>
                        </div>
                    </header>

                    <div className="flex flex-row gap-1 flex-wrap">
                        <MapPin />
                        <p>{p.location}</p>
                    </div>

                    <div className="flex flex-row flex-wrap gap-2">
                        {detailItems}
                    </div>

                    <p>KSh {p.rent}/month</p>
                    <footer className="flex flex-col lg:flex-row gap-1">
                        <div className="flex flex-row gap-2 flex-wrap">
                            <Button className="flex-1">
                                <Eye />
                                <p>View</p>
                            </Button>
                            <Button className="flex-1">
                                <Pencil />
                                <p>Edit</p>
                            </Button>
                        </div>

                        <Button className="lg:flex-1">
                            <Trash />
                            <p>Delete</p>
                        </Button>
                    </footer>
                </section>
            </li>
        );
    });

    return (
        <article>
            <header className="flex flex-row justify-between my-4">
                <h2>My Properties</h2>
                <p>3 properties</p>
            </header>
            <ul className="flex flex-col gap-4">
                {propertiesListItems}
            </ul>
        </article>
    );
}