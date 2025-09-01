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
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
  }),
  images: z
    .array(z.url({ protocol: /^https$/ }))
    .min(1, "At least one image is required"),
  totalValue: z.number().positive("Total value must be greater than 0"),
  fractionPrice: z.number().positive("Fraction price must be greater than 0"),
  totalFractions: z
    .number()
    .int()
    .positive("Total fractions must be greater than 0"),
  agencyId: z.string("Invalid agency ID"),
  rentPerMonth: z.number().positive("Monthly rent must be greater than 0"),
  serviceFeePercent: z.number().min(0).max(100),
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
      },
      images: ["https://some-random-url.com"],
      totalValue: 0,
      fractionPrice: 0,
      totalFractions: 0,
      agencyId: "",
      rentPerMonth: 0,
      serviceFeePercent: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const onSubmit = (data: AddPropertyFormData) => {
    console.log("Form submitted:", data);
    toast.success(
      "The property is under review , we will get back to your shortly",
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
            <div className=" space-y-2">
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

            <div className=" space-y-2">
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
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className=" space-y-2">
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
              <div className=" space-y-2">
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

              <div className=" space-y-2">
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
                } else {
                  form.setValue("location.coordinates", undefined);
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
              <div className=" space-y-2">
                <Label htmlFor="totalValue">Total Value (KSH)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  {...form.register("totalValue", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.totalValue && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.totalValue.message}
                  </p>
                )}
              </div>

              <div className=" space-y-2">
                <Label htmlFor="fractionPrice">Fraction Price (KSH)</Label>
                <Input
                  id="fractionPrice"
                  type="number"
                  step="0.01"
                  {...form.register("fractionPrice", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.fractionPrice && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.fractionPrice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className=" space-y-2">
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

              <div className=" space-y-2">
                <Label htmlFor="rentPerMonth">Monthly Rent (KSH)</Label>
                <Input
                  id="rentPerMonth"
                  type="number"
                  step="0.01"
                  {...form.register("rentPerMonth", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.rentPerMonth && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.rentPerMonth.message}
                  </p>
                )}
              </div>
            </div>

            <div className=" space-y-2">
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

        {/* TODO: WORK ON IMAGE UPLOADS*/}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Image upload will be implemented with UploadThing
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Still working on this - Anthony
              </p>
            </div>
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
