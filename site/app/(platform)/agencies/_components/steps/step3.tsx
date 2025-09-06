import { AddPropertyFormData } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NextButton } from "../next-button";
export const Step3 = () => {
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tenant.address">Tenant Address</Label>
          <Input
            id="tenant.address"
            {...register("tenant.address")}
            placeholder="Tenant wallet/contact address"
          />
          {errors.tenant?.address && (
            <p className="text-sm text-red-500 mt-1">
              {errors.tenant.address.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant.rentAmount">Rent Amount (KSH)</Label>
          <Input
            id="tenant.rentAmount"
            type="number"
            step="0.01"
            {...register("tenant.rentAmount", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.tenant?.rentAmount && (
            <p className="text-sm text-red-500 mt-1">
              {errors.tenant.rentAmount.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant.rentDate">Rent Date</Label>
        <Input
          id="tenant.rentDate"
          type="date"
          {...register("tenant.rentDate", { valueAsDate: true })}
        />
        {errors.tenant?.rentDate && (
          <p className="text-sm text-red-500 mt-1">
            {errors.tenant.rentDate.message}
          </p>
        )}
      </div>
      <NextButton onClick={handleStepSubmit} />
    </>
  );
};
