import { getEditPropertyDetails } from "@/server-actions/agent/dashboard/getPropertyApartmentDetails";
import ApartmentDetailsUpdateForm from "./_components/ApartmentDetailsUpdateForm";

interface EditApartmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApartmentPage({
  params,
}: EditApartmentPageProps) {
  const { id } = await params;
  const apartmentDetails = await getEditPropertyDetails(id);

  return (
    <div className="container mx-auto py-6">
      <ApartmentDetailsUpdateForm
        propertyId={id}
        initialData={apartmentDetails}
      />
    </div>
  );
}
