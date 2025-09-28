"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, User, Home, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateProperty } from "@/server-actions/agent/dashboard/updateProperty";

import { Properties } from "@/db/collections";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// Zod schema for apartment details validation
// Zod schema for apartment details validation
const tenantSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== "object") return undefined;
    const tenant = value as Record<string, unknown>;
    const hasContent = Object.entries(tenant).some(([key, val]) => {
      if (key === "paymentHistory") {
        return Array.isArray(val) && val.length > 0;
      }
      if (val instanceof Date) {
        return !Number.isNaN(val.getTime());
      }
      if (typeof val === "number") {
        return !Number.isNaN(val);
      }
      return val !== "" && val !== null && val !== undefined;
    });
    return hasContent ? value : undefined;
  },
  z
    .object({
      name: z.string().min(1, "Tenant name is required"),
      email: z.email("Valid email is required"),
      number: z.string().min(1, "Phone number is required"),
      rent: z.number().min(0, "Rent cannot be negative"),
      joinDate: z.date(),
      paymentHistory: z.array(
        z.object({
          date: z.date(),
          amount: z.number().min(0),
          status: z.enum(["paid", "pending", "overdue", "partial"]),
        }),
      ),
    })
    .optional(),
);

const apartmentDetailsSchema = z.object({
  floors: z
    .number()
    .min(1, "Must have at least 1 floor")
    .max(100, "Maximum 100 floors"),
  parkingSpace: z.number().min(0, "Parking spaces cannot be negative"),
  units: z
    .array(
      z.object({
        name: z.string().min(1, "Unit name is required"),
        tenant: tenantSchema,
      }),
    )
    .min(1, "At least one unit is required"),
});
      },
  });

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control: form.control,
    name: "units",
  });

  const onSubmit = async (data: ApartmentDetailsForm) => {
    try {
      setSubmitting(true);
      setError(null);

      await updateProperty(propertyId, { apartmentDetails: data });

      toast.success("Apartment details updated successfully!");
    } catch (err) {
      toast.error("Failed to update apartment details");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const addPaymentHistory = (unitIndex: number) => {
    const currentPayments =
      form.getValues(`units.${unitIndex}.tenant.paymentHistory`) || [];
    form.setValue(`units.${unitIndex}.tenant.paymentHistory`, [
      ...currentPayments,
      {
        date: new Date(),
        amount: 0,
        status: "pending" as const,
      },
    ]);
  };

  const removePaymentHistory = (unitIndex: number, paymentIndex: number) => {
    const currentPayments =
      form.getValues(`units.${unitIndex}.tenant.paymentHistory`) || [];
    const updatedPayments = currentPayments.filter(
      (_, index) => index !== paymentIndex,
    );
    form.setValue(`units.${unitIndex}.tenant.paymentHistory`, updatedPayments);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Home className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Update Apartment Details</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Building Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floors">Number of Floors</Label>
              <Input
                id="floors"
                type="number"
                {...form.register("floors", { valueAsNumber: true })}
                className="mt-1"
              />
              {form.formState.errors.floors && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.floors.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="parkingSpace">Parking Spaces</Label>
              <Input
                id="parkingSpace"
                type="number"
                {...form.register("parkingSpace", { valueAsNumber: true })}
                className="mt-1"
              />
              {form.formState.errors.parkingSpace && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.parkingSpace.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Units Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Units Management ({unitFields.length} units)
            </CardTitle>
            <Button
              type="button"
              onClick={() => appendUnit({ name: "", tenant: undefined })}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {unitFields.map((field, unitIndex) => (
              <Card key={field.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Unit #{unitIndex + 1}
                    </CardTitle>
                    {unitFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeUnit(unitIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Unit Name */}
                  <div>
                    <Label htmlFor={`units.${unitIndex}.name`}>Unit Name</Label>
                    <Input
                      {...form.register(`units.${unitIndex}.name`)}
                      placeholder="e.g., Unit 101, Apartment A"
                      className="mt-1"
                    />
                    {form.formState.errors.units?.[unitIndex]?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.units[unitIndex]?.name?.message}
                      </p>
                    )}
                  </div>

                  {/* Tenant Information Tabs */}
                  <Tabs defaultValue="tenant" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="tenant">Tenant Details</TabsTrigger>
                      <TabsTrigger value="payments">
                        Payment History
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tenant" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`units.${unitIndex}.tenant.name`}>
                            Tenant Name
                          </Label>
                          <Input
                            {...form.register(`units.${unitIndex}.tenant.name`)}
                            placeholder="Full name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`units.${unitIndex}.tenant.email`}>
                            Email
                          </Label>
                          <Input
                            {...form.register(
                              `units.${unitIndex}.tenant.email`,
                            )}
                            type="email"
                            placeholder="email@example.com"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`units.${unitIndex}.tenant.number`}>
                            Phone Number
                          </Label>
                          <Input
                            {...form.register(
                              `units.${unitIndex}.tenant.number`,
                            )}
                            placeholder="+1234567890"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`units.${unitIndex}.tenant.rent`}>
                            Monthly Rent
                          </Label>
                          <Input
                            {...form.register(
                              `units.${unitIndex}.tenant.rent`,
                              { valueAsNumber: true },
                            )}
                            type="number"
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`units.${unitIndex}.tenant.joinDate`}>
                            Join Date
                          </Label>
                          <Input
                            {...form.register(
                              `units.${unitIndex}.tenant.joinDate`,
                              {
                                valueAsDate: true,
                              },
                            )}
                            type="date"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment History
                        </h4>
                        <Button
                          type="button"
                          onClick={() => addPaymentHistory(unitIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment
                        </Button>
                      </div>

                      {form
                        .watch(`units.${unitIndex}.tenant.paymentHistory`)
                        ?.map((payment, paymentIndex) => (
                          <Card key={paymentIndex} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  {...form.register(
                                    `units.${unitIndex}.tenant.paymentHistory.${paymentIndex}.date`,
                                    {
                                      valueAsDate: true,
                                    },
                                  )}
                                  type="date"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Amount</Label>
                                <Input
                                  {...form.register(
                                    `units.${unitIndex}.tenant.paymentHistory.${paymentIndex}.amount`,
                                    {
                                      valueAsNumber: true,
                                    },
                                  )}
                                  type="number"
                                  placeholder="0"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Status</Label>
                                <Select
                                  value={form.watch(
                                    `units.${unitIndex}.tenant.paymentHistory.${paymentIndex}.status`,
                                  )}
                                  onValueChange={(value) =>
                                    form.setValue(
                                      `units.${unitIndex}.tenant.paymentHistory.${paymentIndex}.status`,
                                      value as any,
                                    )
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="overdue">
                                      Overdue
                                    </SelectItem>
                                    <SelectItem value="partial">
                                      Partial
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removePaymentHistory(unitIndex, paymentIndex)
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        )) || (
                          <p className="text-gray-500 text-center py-4">
                            No payment history added yet
                          </p>
                        )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <Spinner size="small" className="text-white" />
            ) : (
              "Update Apartment Details"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
