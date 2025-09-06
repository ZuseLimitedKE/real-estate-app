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
      {/*TODO: Add Amenities*/}
      <div className="space-y-2"></div>
      <NextButton onClick={handleStepSubmit} />
    </>
  );
};
