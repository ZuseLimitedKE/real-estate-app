import { AddPropertyFormData } from "@/types/property";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tenant.name">Tenant Name</Label>
          <Input
            id="tenant.name"
            {...register("tenant.name")}
            placeholder="Tenant name"
          />
          {errors.tenant?.name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.tenant.name.message}
            </p>
          )}
        </div>

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
          <Label htmlFor="tenant.email">Tenant Email</Label>
          <Input
            id="tenant.email"
            type="email"
            {...register("tenant.email")}
            placeholder="Tenant email"
          />
          {errors.tenant?.address && (
            <p className="text-sm text-red-500 mt-1">
              {errors.tenant.address.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant.number">Tenant Phone number</Label>
          <Input
            id="tenant.number"
            {...register("tenant.number")}
            placeholder="0700000000"
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

      <div className="space-y-2">
        <Label htmlFor="tenant.joinDate">Tenant Join Date</Label>
        <Controller
          name="tenant.joinDate"
          control={control}
          render={({ field }) => (
            <Popover >
              <PopoverTrigger asChild>
                <Button
                  id="tenant.joinDate"
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.tenant?.joinDate && (
          <p className="text-sm text-red-500 mt-1">
            {errors.tenant.joinDate.message}
          </p>
        )}
      </div>

    </>
  );
};
