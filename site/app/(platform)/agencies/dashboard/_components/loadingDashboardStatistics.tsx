import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAgentDashboardStatistics() {
  return (
    <article className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <Skeleton className="rounded-lg h-[100px]" />
      <Skeleton className="rounded-lg h-[100px]" />
      <Skeleton className="rounded-lg h-[100px]" />
      <Skeleton className="rounded-lg h-[100px]" />
    </article>
  );
}
