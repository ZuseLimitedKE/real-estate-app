import { AddPropertyFormData } from "@/types/property";
import { useFormContext, Controller } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NextButton } from "../next-button";
function formatOrdinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
export const Step3 = () => {
  const {
    register,
    control,
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
        <Label htmlFor="tenant.rentDate">Monthly Rent Due Date</Label>
        <Controller
          name="tenant.rentDate"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => field.onChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select day of month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {formatOrdinal(day)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
