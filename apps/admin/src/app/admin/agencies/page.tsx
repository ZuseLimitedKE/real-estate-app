/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel } from "@/lib/db/models/User";
import AgenciesTable from "@/components/agencies/AgenciesTable";
import AgenciesFilters from "@/components/agencies/AgenciesFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serializeDocuments } from "@/lib/utils/serialization";

interface AgenciesPageProps {
  searchParams?: {
    status?: string;
    search?: string;
    page?: string;
  };
}

export default async function AgenciesPage({
  searchParams,
}: AgenciesPageProps) {
  const status = searchParams?.status ?? "pending";
  const search = searchParams?.search ?? "";
  const page = parseInt(searchParams?.page ?? "1", 10) || 1;
  const limit = 10;

  let agencies = [];
  let totalCount = 0;

  if (status === "all") {
    // Fetch all agencies regardless of status
    agencies = await UserModel.findByRole("AGENCY", limit, (page - 1) * limit);
    totalCount = await UserModel.countAgencies();
  } else {
    const normalized = status.toUpperCase() as any;
    agencies = await UserModel.findAgenciesByStatus(
      normalized,
      limit,
      (page - 1) * limit
    );
    // Derive total by status using aggregate stats
    const stats = await UserModel.getAgencyStats();
    const match = stats.find((s: any) => s._id === normalized);
    totalCount = match?.count ?? 0;
  }

  // Serialize MongoDB documents to plain objects
  const serializedAgencies = serializeDocuments(agencies);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          Agencies Management
        </h1>
        <p className="text-secondary-600 mt-2">
          Review and manage agency applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agency Applications</span>
            <AgenciesFilters currentStatus={status} searchQuery={search} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AgenciesTable
            agencies={serializedAgencies}
            currentPage={page}
            totalPages={totalPages}
            currentStatus={status}
            searchQuery={search}
          />
        </CardContent>
      </Card>
    </div>
  );
}
