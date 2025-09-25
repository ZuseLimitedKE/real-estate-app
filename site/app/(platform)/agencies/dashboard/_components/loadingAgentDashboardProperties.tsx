import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAgentDashboardProperties() {
  return (
    <article className="space-y-6">
      {/* Header matching the properties component */}
      <header className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" /> {/* Title skeleton */}
          <Skeleton className="h-5 w-64" /> {/* Description skeleton */}
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-8 mb-1 ml-auto" />{" "}
          {/* Property count skeleton */}
          <Skeleton className="h-4 w-16" /> {/* "Properties" text skeleton */}
        </div>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <li key={index}>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />

              {/* Property Content skeleton */}
              <div className="p-4 space-y-3">
                {/* Header with name, status, and actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-6 w-3/4 mb-2" />{" "}
                    {/* Property name */}
                    <Skeleton className="h-5 w-16 rounded-full" />{" "}
                    {/* Status badge */}
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />{" "}
                  {/* More actions button */}
                </div>

                {/* Location skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* Map pin icon */}
                  <Skeleton className="h-4 w-2/3" /> {/* Location text */}
                </div>

                {/* Property Details grid skeleton */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>

                {/* Rent Price skeleton */}
                <div className="pt-2 border-t border-border">
                  <Skeleton className="h-7 w-32" /> {/* Price text */}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination skeleton */}
      <div className="flex justify-center pt-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" /> {/* Previous button */}
          <Skeleton className="h-9 w-9" /> {/* Page number */}
          <Skeleton className="h-9 w-9" /> {/* Page number */}
          <Skeleton className="h-9 w-9" /> {/* Page number */}
          <Skeleton className="h-9 w-16" /> {/* Next button */}
        </div>
      </div>
    </article>
  );
}
