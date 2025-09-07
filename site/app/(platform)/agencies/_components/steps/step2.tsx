import { AddPropertyFormData } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "../location-picker";
export const Step2 = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<AddPropertyFormData>();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...register("location.address")}
          placeholder="Enter full address"
        />
        {errors.location?.address && (
          <p className="text-sm text-red-500 mt-1">
            {errors.location.address.message}
          </p>
        )}
      </div>

      <LocationPicker
        onCoordinatesChange={(coords) => {
          if (coords) {
            setValue("location.coordinates", coords);
          }
        }}
        initialCoordinates={watch("location.coordinates")}
      />
      {errors.location?.coordinates && (
        <p className="text-sm text-red-500 mt-1  ">
          {errors.location.coordinates.message}
        </p>
      )}
    </>
  );
};
