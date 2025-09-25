/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropertyModel } from '@/lib/db/models/Property';
import PropertiesTable from '@/components/properties/PropertiesTable';
import PropertiesFilters from '@/components/properties/PropertiesFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { serializeDocuments } from '@/lib/utils/serialization';

interface PropertiesPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

/**
 * Render the Properties Management admin page with filters and a paginated properties table.
 *
 * @param searchParams - Promise resolving to query parameters containing optional `status`, `search`, and `page` strings used to filter and paginate the listings
 * @returns A React element representing the Properties Management page, including a filters control and a paginated table of properties
 */
export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams;
  const status = params.status as any || 'pending';
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);
  const limit = 10;

  const properties = await PropertyModel.findByStatus(status, limit, (page - 1) * limit);
  const totalCount = await PropertyModel.countProperties();
  
  // Serialize MongoDB documents to plain objects
  const serializedProperties = serializeDocuments(properties);
  
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Properties Management</h1>
        <p className="text-muted-foreground mt-2">Review and manage property listings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Property Listings</span>
            <PropertiesFilters currentStatus={status} searchQuery={search} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PropertiesTable 
            properties={serializedProperties} 
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