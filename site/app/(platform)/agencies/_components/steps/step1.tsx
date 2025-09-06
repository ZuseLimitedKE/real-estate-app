import { AddPropertyFormData } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NextButton } from "../next-button";
export const Step1 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<AddPropertyFormData>();

  const { nextStep } = useMultiStepForm();

  const handleStepSubmit = () => {
    nextStep();
  };
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Property Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter the name of the property"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe the property..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
      <div className="grid">
        <div className="space-y-2">
          <Label htmlFor="gross_property_size">Property Size (sq ft)</Label>
          <Input
            id="gross_property_size"
            type="number"
            step="0.01"
            {...register("gross_property_size", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.gross_property_size && (
            <p className="text-sm text-red-500 mt-1">
              {errors.gross_property_size.message}
            </p>
          )}
        </div>
      </div>
      {/*TODO: Add Amenities*/}
      <div className="space-y-2">
        {errors.amenities && (
          <p className="text-sm text-red-500 mt-1">
            {errors.amenities.message}
          </p>
        )}
      </div>
      <NextButton onClick={handleStepSubmit} />
    </>
  );
};
