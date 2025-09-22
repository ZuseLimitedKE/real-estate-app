import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dot, File } from "lucide-react";

export default function PropertyDocuments() {
    return (
        <section className="my-4">
            <Card>
                <CardHeader>
                    <h2>Property Documents</h2>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <section className="flex flex-row justify-between items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <File className="w-6 h-6 text-primary" />
                            <div>
                                <p>Title Deed</p>
                                <p className="flex flex-row items-center">
                                    <span>PDF</span>
                                    <Dot className="w-4 h-4" />
                                    <span>2.3 MB</span>
                                </p>
                            </div>
                        </div>


                        <Button variant='outline'>
                            View
                        </Button>
                    </section>
                    <section className="flex flex-row justify-between items-center">
                        <div className="flex flex-row gap-2 items-center">
                            <File className="w-6 h-6 text-primary" />
                            <div>
                                <p>Title Deed</p>
                                <p className="flex flex-row items-center">
                                    <span>PDF</span>
                                    <Dot className="w-4 h-4" />
                                    <span>2.3 MB</span>
                                </p>
                            </div>
                        </div>


                        <Button variant='outline'>
                            View
                        </Button>
                    </section>
                </CardContent>
            </Card>
        </section>
    );
}