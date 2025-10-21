import { CreatePropertyType } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationPicker } from "../../location-picker";
export const Step2 = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<CreatePropertyType>();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...register("single_property_details.location.address")}
          placeholder="Enter full address"
        />
        {errors.single_property_details?.location?.address && (
          <p className="text-sm text-red-500 mt-1">
            {errors.single_property_details?.location.address.message}
          </p>
        )}
      </div>

      <LocationPicker
        onCoordinatesChange={(coords) => {
          setValue(
            "single_property_details.location.coordinates",
            coords ?? (undefined as any),
            {shouldDirty: true, shouldTouch: true, shouldValidate: true}
          );
        }}
        initialCoordinates={watch("single_property_details.location.coordinates")}
      />
      {errors.single_property_details?.location?.coordinates && (
        <p className="text-sm text-red-500 mt-1  ">
          {errors.single_property_details?.location.coordinates.message}
        </p>
      )}
    </>
  );
};
