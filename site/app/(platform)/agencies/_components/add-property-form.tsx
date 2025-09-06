"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "./location-picker";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import type { AddPropertyFormData } from "@/types/property";
import { addPropertySchema } from "@/types/property";
import { AddProperty } from "@/server-actions/property/add-property";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
export function AddPropertyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      name: "",
      description: "",
      amenities: {
        bedrooms: null,
        bathrooms: null,
      },
      location: {
        address: "",
        coordinates: {
          lat: -1.286389,
          lng: 36.817223,
        },
      },
      images: [],
      documents: [],
      property_status: "pending" as const,
      agencyId: "randomId",
      token_address: "randomAddress",
      proposedRentPerMonth: 0,
      serviceFeePercent: 10,
      property_value: 0,
      gross_property_size: 0,
      tenant: undefined,
      time_listed_on_site: Date.now(),
      property_owners: [],
      secondary_market_listings: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const onSubmit = async (data: AddPropertyFormData) => {
    setIsSubmitting(true);
    try {
      const initialPricePerToken = 100;
      const totalFractions = Math.floor(
        data.property_value / initialPricePerToken,
      );
      await AddProperty({ ...data, totalFractions });
      toast.success(
        "The property is under review ,we will get back to you shortly",
      );
      form.reset();
    } catch (err) {
      toast.error(
        "Unable to submit this property for review. Please try again later",
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="space-y-2"></div>
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
            <div className="grid">
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
            </div>
            <div className="grid">
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

        {/* Document Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Property Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadDropzone
              endpoint="documentUploader"
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
                const newDocuments =
                  res
                    ?.map((file) => ({
                      url: file.ufsUrl,
                      name: file.name,
                    }))
                    .filter(Boolean) || [];

                const currentDocuments = form.getValues("documents");
                const updatedDocuments = Array.from(
                  new Set([...currentDocuments, ...newDocuments]),
                );
                form.setValue("documents", updatedDocuments, {
                  shouldValidate: true,
                });
                toast.success(
                  `${newDocuments.length > 1 ? "Documents" : "Document"} uploaded successfully`,
                );
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload Failed! ${error.message}`);
              }}
              onUploadBegin={(fileName) => {
                toast.info(`Uploading ${fileName}...`);
              }}
            />

            {form.formState.errors.documents && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.documents.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? <Spinner size="small" /> : "Add Property"}
        </Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset Form
        </Button>
      </div>
    </form>
  );
}
