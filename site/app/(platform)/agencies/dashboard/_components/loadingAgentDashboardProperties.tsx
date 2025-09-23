import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAgentDashboardProperties() {
    return (
        <article>
            <header className="flex flex-row justify-between my-4">
                <h2 className="font-bold text-2xl">My Properties</h2>
            </header>
            <section className="border border-solid border-slate-300 p-4 rounded-md">
                <Skeleton className="h-[300px] mx-auto mb-4" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-[50px]" />
                    <Skeleton className="h-[50px]" />
                </div>

            </section>
        </article>
    );
}