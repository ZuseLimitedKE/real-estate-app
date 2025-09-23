"use server";

import { Button } from "@/components/ui/button";
import getDashboardProperties from "@/server-actions/agent/dashboard/getProperties";
import { Eye, MapPin, Pencil, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function AgentDashboardProperties(props: { page: number }) {
    const properties = await getDashboardProperties(props.page);

    const propertiesListItems = properties.map((p) => {
        const detailItems = p.details.map((d, index) => (
            <p key={index}>
                <span className="font-bold text-sm">{d.title}: </span>
                <span>{d.value}</span>
            </p>
        ));

        return (
            <li key={p.id}>
                <section className="flex flex-col gap-2 rounded-md border border-solid border-slate-300">
                    <header>
                        <div className="bg-slate-200">
                            <Image
                                src={p.image}
                                alt={p.name}
                                width={500}
                                height={500}
                                className="max-w-full object-fit lg:mx-auto"
                            />
                        </div>

                        <div className="flex flex-row gap-2 flex-wrap p-4 items-center">
                            <p className="text-lg font-bold">{p.name}</p>
                            <div className="px-2 py-1 rounded-full bg-primary text-white font-bold text-xs">
                                <p>{p.status}</p>
                            </div>
                        </div>
                    </header>

                    <div className="px-4 pb-4 flex flex-col gap-2">
                        <div className="flex flex-row gap-1 flex-wrap items-center">
                            <MapPin className="w-4 h-4" />
                            <p className="text-slate-500">{p.location}</p>
                        </div>

                        <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:gap-4">
                            {detailItems}
                        </div>

                        <p className="font-bold text-lg">KSh {p.rent}/month</p>
                        <footer className="flex flex-col lg:flex-row gap-1">
                            <div className="flex flex-row gap-2 flex-wrap">
                                <Button className="flex-1" variant='outline' asChild>
                                    <Link href={`/agencies/properties/${p.id}`}>
                                        <Eye />
                                        <p>View</p>
                                    </Link>
                                </Button>
                                <Button className="flex-1" variant='outline'>
                                    <Pencil />
                                    <p>Edit</p>
                                </Button>
                            </div>

                            <Button className="lg:flex-1" variant='destructive'>
                                <Trash />
                                <p>Delete</p>
                            </Button>
                        </footer>
                    </div>

                </section>
            </li>
        );
    });

    return (
        <article>
            <header className="flex flex-row justify-between my-4">
                <h2 className="font-bold text-2xl">My Properties</h2>
                <p className="text-slate-400">{properties.length} properties</p>
            </header>
            <ul className="flex flex-col gap-4">
                {propertiesListItems}
            </ul>
            {/* <div className="mt-4 flex flex-row justify-center">
                <PaginationControls page={page} updatePage={(num) => {
                    // Get data for next page
                    setPage(num);
                }} isThereMore={props.properties.length >= RESULT_PAGE_SIZE} />
            </div> */}
        </article>
    );
}