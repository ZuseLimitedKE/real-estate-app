import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPropertyDocument } from "@/types/agent_dashboard";
import { Dot, File } from "lucide-react";
import Link from "next/link";

export default function PropertyDocuments(props: {documents: AgentPropertyDocument[]}) {
    const propertyDocuments = props.documents.map((doc, index) => (
        <li key={index}>
            <section className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                    <File className="w-6 h-6 text-primary" />
                    <div>
                        <p>{doc.name}</p>
                        <p className="flex flex-row items-center">
                            <span>{doc.type}</span>
                            <Dot className="w-4 h-4" />
                            <span>{doc.size}</span>
                        </p>
                    </div>
                </div>

                <Link href={doc.url}>
                    <Button variant='outline'>
                        View
                    </Button>
                </Link>
            </section>
        </li>
    ));

    return (
        <section className="my-4">
            <Card>
                <CardHeader>
                    <h2>Property Documents</h2>
                </CardHeader>
                <CardContent >
                    <ul className="flex flex-col gap-4">
                        {propertyDocuments}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}