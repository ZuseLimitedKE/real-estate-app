import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAgentDashboardStatistics() {
    return (
        <article className="lg:grid lg:grid-cols-2 lg:gap-4 flex flex-col gap-3 mb-4">
            <Skeleton className="rounded-lg h-[100px]" />
            <Skeleton className="rounded-lg h-[100px]" />
            <Skeleton className="rounded-lg h-[100px]" />
            <Skeleton className="rounded-lg h-[100px]" />
        </article>
    );
}