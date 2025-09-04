"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "./location-picker";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";

export const addPropertySchema = z.object({
  name: z.string().min(3, "Property title is required"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  images: z
    .array(z.url({ protocol: /^https$/ }))
    .min(1, "At least one image is required"),
  totalFractions: z
    .number()
    .int()
    .positive("Total fractions must be greater than 0"),
  agencyId: z.string().min(1, "Invalid agency ID"),
  proposedRentPerMonth: z
    .number()
    .positive("Proposed rent per month must be greater than 0"),
  serviceFeePercent: z.number().min(0).max(100),
  token_address: z.string().min(1, "Token address is required"),
  property_value: z.number().positive("Property value must be greater than 0"),
  gross_property_size: z
    .number()
    .positive("Property size must be greater than 0"),
  price: z.number().positive("Price must be greater than 0"),
  tenant: z
    .object({
      address: z.string().min(1, "Tenant address is required"),
      rentDate: z.date(),
      rentAmount: z.number().positive("Rent amount must be greater than 0"),
    })
    .nullable()
    .optional(),
  time_listed_on_site: z.number().int().positive(),
  property_owners: z.array(
    z.object({
      owner_address: z.string().min(1, "Owner address is required"),
      amount_owned: z.number().positive("Amount owned must be greater than 0"),
      purchase_time: z.date(),
    }),
  ),
  secondary_market_listings: z.array(
    z.object({
      lister_address: z.string().min(1, "Lister address is required"),
      amount_listed: z
        .number()
        .positive("Amount listed must be greater than 0"),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create a type for the form data
type AddPropertyFormData = z.infer<typeof addPropertySchema>;

export function AddPropertyForm() {
  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      name: "",
      description: "",
      location: {
        address: "",
        city: "Nairobi",
        country: "Kenya",
        coordinates: {
          lat: -1.286389,
          lng: 36.817223,
        },
      },
      images: [],
      totalFractions: 100,
      agencyId: "randomId",
      token_address: "randomAddress",
      proposedRentPerMonth: 0,
      serviceFeePercent: 10,
      property_value: 0,
      gross_property_size: 0,
      price: 0,
      tenant: null,
      time_listed_on_site: Date.now(),
      property_owners: [],
      secondary_market_listings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const onSubmit = (data: AddPropertyFormData) => {
    console.log("Form submitted:", data);
    toast.success(
      "The property is under review, we will get back to you shortly",
    );
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 max-w-4xl mx-auto p-6"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter the name of the property"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Describe the property..."
                rows={4}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid">
              <div className="space-y-2">
                <Label htmlFor="gross_property_size">
                  Property Size (sq ft)
                </Label>
                <Input
                  id="gross_property_size"
                  type="number"
                  step="0.01"
                  {...form.register("gross_property_size", {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
                {form.formState.errors.gross_property_size && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.gross_property_size.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...form.register("location.address")}
                placeholder="Enter full address"
              />
              {form.formState.errors.location?.address && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.location.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...form.register("location.city")}
                  placeholder="City"
                />
                {form.formState.errors.location?.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.location.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...form.register("location.country")}
                  placeholder="Country"
                />
                {form.formState.errors.location?.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.location.country.message}
                  </p>
                )}
              </div>
            </div>

            <LocationPicker
              onCoordinatesChange={(coords) => {
                if (coords) {
                  form.setValue("location.coordinates", coords);
                }
              }}
              initialCoordinates={form.watch("location.coordinates")}
            />
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_value">Property Value (KSH)</Label>
                <Input
                  id="property_value"
                  type="number"
                  step="0.01"
                  {...form.register("property_value", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.property_value && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.property_value.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KSH)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register("price", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalFractions">Total Fractions</Label>
                <Input
                  id="totalFractions"
                  type="number"
                  {...form.register("totalFractions", { valueAsNumber: true })}
                  placeholder="100"
                />
                {form.formState.errors.totalFractions && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.totalFractions.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedRentPerMonth">
                  Proposed Monthly Rent (KSH)
                </Label>
                <Input
                  id="proposedRentPerMonth"
                  type="number"
                  step="0.01"
                  {...form.register("proposedRentPerMonth", {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
                {form.formState.errors.proposedRentPerMonth && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.proposedRentPerMonth.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceFeePercent">Service Fee (%)</Label>
              <Input
                id="serviceFeePercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                {...form.register("serviceFeePercent", { valueAsNumber: true })}
                placeholder="10"
              />
              {form.formState.errors.serviceFeePercent && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.serviceFeePercent.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tenant Information (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant.address">Tenant Address</Label>
                <Input
                  id="tenant.address"
                  {...form.register("tenant.address")}
                  placeholder="Tenant wallet/contact address"
                />
                {form.formState.errors.tenant?.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.tenant.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant.rentAmount">Rent Amount (KSH)</Label>
                <Input
                  id="tenant.rentAmount"
                  type="number"
                  step="0.01"
                  {...form.register("tenant.rentAmount", {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
                {form.formState.errors.tenant?.rentAmount && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.tenant.rentAmount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant.rentDate">Rent Date</Label>
              <Input
                id="tenant.rentDate"
                type="date"
                {...form.register("tenant.rentDate", { valueAsDate: true })}
              />
              {form.formState.errors.tenant?.rentDate && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.tenant.rentDate.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Images */}
        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadDropzone
              endpoint="imageUploader"
              appearance={{
                container:
                  "w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors duration-200",
                uploadIcon: "text-gray-400",
                label: "text-gray-600 font-medium hover:text-primary",
                allowedContent: "text-gray-500 text-sm",
                button:
                  "bg-primary hover:bg-primary/90 ut-ready:bg-primary ut-uploading:bg-primary/50 ut-readying:bg-primary/70 focus:outline-primary transition-all duration-200",
              }}
              content={{
                uploadIcon: ({ ready, isUploading }) => {
                  if (isUploading) return "📤";
                  if (ready) return "📁";
                  return "⏳";
                },
                label: ({ ready, isUploading }) => {
                  if (isUploading) return "Uploading...";
                  if (ready) return "Choose files or drag and drop";
                  return "Getting ready...";
                },
                allowedContent: ({ ready, fileTypes, isUploading }) => {
                  if (isUploading) return "Please wait...";
                  if (!ready) return "Preparing...";
                  return `Allowed: ${fileTypes.join(", ")}`;
                },
              }}
              className="ut-button:bg-primary ut-button:ut-readying:bg-primary/70 ut-button:ut-uploading:bg-primary/50 ut-uploading:ut-button:bg-primary/50 ut-button:hover:bg-primary/90"
              onClientUploadComplete={(res) => {
                const newImageUrls =
                  res?.map((file) => file.ufsUrl).filter(Boolean) || [];

                const currentImages = form.getValues("images");
                const updatedImages = Array.from(
                  new Set([...currentImages, ...newImageUrls]),
                );
                form.setValue("images", updatedImages, {
                  shouldValidate: true,
                });
                toast.success(
                  `${newImageUrls.length > 1 ? "Images" : "Image"} uploaded successfully`,
                );
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload Failed! ${error.message}`);
              }}
              onUploadBegin={(fileName) => {
                toast.info(`Uploading ${fileName}...`);
              }}
            />

            {form.formState.errors.images && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.images.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          Add Property
        </Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset Form
        </Button>
      </div>
    </form>
  );
}
