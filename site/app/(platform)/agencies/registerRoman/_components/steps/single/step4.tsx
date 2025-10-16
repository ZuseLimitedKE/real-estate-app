import { CreatePropertyType } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
export const Step4 = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreatePropertyType>();

  return (
    <>
      <div className="grid">
        <div className="space-y-2">
          <Label htmlFor="property_value">Property Value (KSH)</Label>
          <Input
            id="property_value"
            type="number"
            min="0"
            {...register("single_property_details.property_value", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.single_property_details?.property_value && (
            <p className="text-sm text-red-500 mt-1">
              {errors.single_property_details?.property_value.message}
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
            min="0"
            {...register("single_property_details.proposedRentPerMonth", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.single_property_details?.proposedRentPerMonth && (
            <p className="text-sm text-red-500 mt-1">
              {errors.single_property_details?.proposedRentPerMonth.message}
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
          {...register("single_property_details.serviceFeePercent", { valueAsNumber: true })}
          placeholder="10"
        />
        {errors.single_property_details?.serviceFeePercent && (
          <p className="text-sm text-red-500 mt-1">
            {errors.single_property_details?.serviceFeePercent.message}
          </p>
        )}
      </div>
    </>
  );
};
