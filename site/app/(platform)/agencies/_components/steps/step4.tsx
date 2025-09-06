import { AddPropertyFormData } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NextButton } from "../next-button";
export const Step4 = () => {
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
      <div className="grid">
        <div className="space-y-2">
          <Label htmlFor="property_value">Property Value (KSH)</Label>
          <Input
            id="property_value"
            type="number"
            step="0.01"
            {...register("property_value", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.property_value && (
            <p className="text-sm text-red-500 mt-1">
              {errors.property_value.message}
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
            {...register("proposedRentPerMonth", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.proposedRentPerMonth && (
            <p className="text-sm text-red-500 mt-1">
              {errors.proposedRentPerMonth.message}
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
          {...register("serviceFeePercent", { valueAsNumber: true })}
          placeholder="10"
        />
        {errors.serviceFeePercent && (
          <p className="text-sm text-red-500 mt-1">
            {errors.serviceFeePercent.message}
          </p>
        )}
      </div>

      <NextButton onClick={handleStepSubmit} />
    </>
  );
};
