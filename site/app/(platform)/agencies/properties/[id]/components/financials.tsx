import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentPropertyFinances } from "@/types/agent_dashboard";

export default function PropertyFinancials(props: {finances: AgentPropertyFinances}) {
    return (
        <section className="my-4 flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold">Investment Overview</h2>
                </CardHeader>
                <CardContent>
                    <p className="flex flex-row justify-between">
                        <span>Property Value: </span>
                        <span className="font-bold">Ksh {props.finances.propertyValue}</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>Expected Yield: </span>
                        <span className="font-bold">{props.finances.expectedYield}%</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>Investment Period: </span>
                        <span className="font-bold">5 Years</span>
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-bold">Revenue Analytics</h2>
                </CardHeader>
                <CardContent>
                    <p className="flex flex-row justify-between">
                        <span>Monthly Revenue: </span>
                        <span className="font-bold">Ksh {props.finances.monthlyRevenue}</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>Annual Revenue: </span>
                        <span className="font-bold">Ksh {props.finances.annualRevenue}</span>
                    </p>
                    <p className="flex flex-row justify-between">
                        <span>ROI: </span>
                        <span className="font-bold">{props.finances.roi}%</span>
                    </p>
                </CardContent>
            </Card>
        </section>
    );
}