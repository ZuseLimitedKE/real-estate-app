"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProperty } from "@/server-actions/agent/dashboard/updateProperty";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { EditPropertyDetails } from "@/types/edit_property";
import EditSinglePropertyForm from "./EditSinglePropertyForm";
import EditApartmentPropertyForm from "./EditApartmentPropertyForm";
import { PaymentStatus } from "@/types/property";

// Zod schema for apartment details validation
const tenantSchema = z.object({
  rentDate: z.number().min(1).max(31).int(),
  name: z.string().trim().min(1, "Tenant name is required"),
  email: z.email("Valid email is required"),
  number: z.string().trim().min(1, "Phone number is required"),
  rentAmount: z.number().gt(0, "Rent must be more than 0"),
  address: z.string().trim().min(1, "Tenant address is required"),
  joinDate: z.date()
});

export const paymentsSchema = z.object({
  date: z.date(),
  amount: z.number().gt(0),
  status: z.enum([PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL]),
});

const single_property_edit_schema = z.object({
  tenant: tenantSchema.optional(),
  payments: z.array(paymentsSchema)
});

export const apartmentUnitSchema = z.object({
  id: z.string(),
  token_details: z.object({
    address: z.string(),
    total_fractions: z.number(),
  }),
  owner: z.array(z.object({
    investor_id: z.string(),
    investor_address: z.string(),
    fractions_owned: z.number(),
    purchase_time: z.date(),
    purchase_transaction_hash: z.string(),
  })).optional(),
  secondary_market_listings: z.array(z.object({
    lister_address: z.string(),
    amount_listed: z.number()
  })),
  name: z.string().trim().min(1, "Unit name is required"),
  templateID: z.string(),
  floor: z.number().min(0).max(100),
  tenant: tenantSchema.optional(),
  payments: z.array(paymentsSchema)
})

const apartment_property_edit_schema = z.object({
  num_floors: z
    .number()
    .min(1, "Must have at least 1 floor")
    .max(100, "Maximum 100 floors"),
  parking_spaces: z.number().min(0, "Parking spaces cannot be negative"),
  units: z.array(apartmentUnitSchema),
  templates: z.array(z.object({
    id: z.string(),
    amenities: z.object({
      bedrooms: z.number().optional(),
      bathrooms: z.number().optional(),
      balconies: z.number().optional(),
      gym: z.boolean().optional(),
      air_conditioning: z.boolean().optional(),
      heating: z.boolean().optional(),
      laundry_in_unit: z.boolean().optional(),
      dishwasher: z.boolean().optional(),
      storage_space: z.boolean().optional(),
      security_system: z.boolean().optional(),
      elevator: z.boolean().optional(),
      pet_friendly: z.boolean().optional(),
      furnished: z.boolean().optional(),
    }),
    gross_size: z.number(),
    proposedRentPerMonth: z.number(),
    unitValue: z.number(),
    images: z.array(z.string()),
    name: z.string(),
  }))
});

const edit_property_schema = z.object({
  single_property_details: single_property_edit_schema.optional(),
  apartment_details: apartment_property_edit_schema.optional()
});

export type EditPropertyDetailsForm = z.infer<typeof edit_property_schema>;

interface ApartmentDetailsUpdateFormProps {
  propertyId: string;
  initialData: EditPropertyDetails;
}
export default function ApartmentDetailsUpdateForm({
  propertyId,
  initialData,
}: ApartmentDetailsUpdateFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(edit_property_schema),
    defaultValues: initialData
  });

  const onSubmit = async (data: EditPropertyDetailsForm) => {
    try {
      setSubmitting(true);
      setError(null);

      console.log(data);
      await updateProperty(propertyId, data);

      toast.success("Apartment details updated successfully!");
    } catch (err) {
      toast.error("Failed to update apartment details");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Home className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Update Property Details</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {initialData.single_property_details ? <EditSinglePropertyForm /> : initialData.apartment_details ? <EditApartmentPropertyForm templates={initialData.apartment_details.templates} /> : <div>No form</div>}

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Spinner size="small" className="text-white" />
              ) : (
                "Update Property Details"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>

  );
}
