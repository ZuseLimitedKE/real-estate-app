import { LocationPicker } from "../../location-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreatePropertyType } from "@/types/property";
import { useFormContext } from "react-hook-form";

export default function ApartmentEstateDetailsForm() {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<CreatePropertyType>();

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Apartment Name</Label>
        <Input
          id="name"
          {...register("apartment_property_details.name")}
          placeholder="Enter the name of the apartment estate"
        />
        {errors.apartment_property_details?.name && (
          <p className="text-sm text-red-500 mt-1">
            {errors.apartment_property_details?.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Apartment Description</Label>
        <Textarea
          id="description"
          {...register("apartment_property_details.description")}
          placeholder="Describe the apartment estate..."
          rows={4}
        />
        {errors.apartment_property_details?.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.apartment_property_details.description.message}
          </p>
        )}
      </div>

      <section className="space-y-2">
        <div className="space-y-2">
          <Label htmlFor="address">Apartment Address</Label>
          <Input
            id="address"
            {...register("apartment_property_details.location.address")}
            placeholder="Enter full address of estate"
          />
          {errors.apartment_property_details?.location?.address && (
            <p className="text-sm text-red-500 mt-1">
              {errors.apartment_property_details?.location?.address.message}
            </p>
          )}
        </div>

        <LocationPicker
          onCoordinatesChange={(coords) => {
            if (coords) {
              setValue(
                "apartment_property_details.location.coordinates",
                coords,
              );
            }
          }}
          initialCoordinates={watch(
            "apartment_property_details.location.coordinates",
          )}
        />
        {errors.apartment_property_details?.location?.coordinates && (
          <p className="text-sm text-red-500 mt-1  ">
            {errors.apartment_property_details?.location?.coordinates.message}
          </p>
        )}
      </section>

      <div className="space-y-2">
        <Label htmlFor="apartmentDetails.floors">Number of floors</Label>
        <Input
          id="apartmentDetails.floors"
          type="number"
          {...register("apartment_property_details.floors", {
            valueAsNumber: true,
          })}
          placeholder="Enter the number of floors in your apartment"
        />
        {errors.apartment_property_details?.floors && (
          <p className="text-sm text-red-500 mt-1">
            {errors.apartment_property_details?.floors.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="apartmentDetails.parkingSpace">
          Total number of parking spaces
        </Label>
        <Input
          id="apartmentDetails.parkingSpace"
          type="number"
          {...register("apartment_property_details.parking_spaces", {
            valueAsNumber: true,
          })}
          placeholder="Enter total number of parking spaces in the apartment"
        />
        {errors.apartment_property_details?.parking_spaces && (
          <p className="text-sm text-red-500 mt-1">
            {errors.apartment_property_details?.parking_spaces.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serviceFeePercent">Service Fee (%)</Label>
        <Input
          id="serviceFeePercent"
          type="number"
          step="0.1"
          min="0"
          max="100"
          {...register("apartment_property_details.serviceFeePercent", {
            valueAsNumber: true,
          })}
          placeholder="10"
        />
        {errors.apartment_property_details?.serviceFeePercent && (
          <p className="text-sm text-red-500 mt-1">
            {errors.apartment_property_details?.serviceFeePercent.message}
          </p>
        )}
      </div>
    </section>
  );
}
