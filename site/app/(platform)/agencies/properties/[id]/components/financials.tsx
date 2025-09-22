import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PropertyFinancials() {
    return (
        <section className="my-4 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <h2>Investment Overview</h2>
                </CardHeader>
                <CardContent>
                    <p className="flex flex-row justify-between">
                        <span>Property Value: </span>
                        <span>Ksh 15,000,000</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>Expected Yield: </span>
                        <span>8.5%</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>Investment Period: </span>
                        <span>5 Years</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2>Revenue Analytics</h2>
                </CardHeader>
                <CardContent>
                    <p className="flex flex-row justify-between">
                        <span>Monthly Revenue: </span>
                        <span>Ksh 85,000</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>Annual Revenue: </span>
                        <span>Ksh 1,020,000</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>ROI: </span>
                        <span>6.08%</span>
                    </p>
                </CardContent>
            </Card>
        </section>
    );
}