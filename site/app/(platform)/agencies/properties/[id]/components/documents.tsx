import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgentPropertyDocument } from "@/types/agent_dashboard";
import { Dot, File } from "lucide-react";
import Link from "next/link";

export default function PropertyDocuments(props: {
  documents: AgentPropertyDocument[];
}) {
  const propertyDocuments = props.documents.map((doc, index) => (
    <li
      key={index}
      className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <File className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground text-lg">{doc.name}</p>
            <div className="flex items-center text-muted-foreground">
              <span className="text-sm">{doc.type}</span>
              <Dot className="w-4 h-4" />
              <span className="text-sm">{doc.size}</span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="lg" asChild>
          <Link href={doc.url} target="_blank" rel="noopener noreferrer">
            View Document
          </Link>
        </Button>
      </div>
    </li>
  ));

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Property Documents
        </CardTitle>
        <p className="text-muted-foreground">
          {props.documents.length} document
          {props.documents.length !== 1 ? "s" : ""} available
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">{propertyDocuments}</ul>
      </CardContent>
    </Card>
  );
}
