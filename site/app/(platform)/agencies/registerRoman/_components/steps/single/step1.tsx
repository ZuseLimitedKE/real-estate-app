import { CreatePropertyType } from "@/types/property";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Step1 = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreatePropertyType>();

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Property Name</Label>
        <Input
          id="name"
          {...register("single_property_details.name")}
          placeholder="Enter the name of the property"
        />
        {errors.single_property_details?.name && (
          <p className="text-sm text-red-500 mt-1">{errors.single_property_details?.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("single_property_details.description")}
          placeholder="Describe the property..."
          rows={4}
        />
        {errors.single_property_details?.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.single_property_details?.description.message}
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
            {...register("single_property_details.gross_property_size", {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
          {errors.single_property_details?.gross_property_size && (
            <p className="text-sm text-red-500 mt-1">
              {errors.single_property_details?.gross_property_size.message}
            </p>
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Property Amenities</Label>

        {/* Countable Amenities */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amenities.bedrooms">Bedrooms</Label>
            <Input
              id="amenities.bedrooms"
              type="number"
              min="0"
              {...register("single_property_details.amenities.bedrooms", {
                setValueAs: (v) =>
                  v === "" || v == null ? undefined : Number(v),
              })}
              placeholder="0"
            />
            {errors.single_property_details?.amenities?.bedrooms && (
              <p className="text-sm text-red-500 mt-1">
                {errors.single_property_details?.amenities.bedrooms.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities.bathrooms">Bathrooms</Label>
            <Input
              id="amenities.bathrooms"
              type="number"
              min="0"
              step="0.5"
              {...register("single_property_details.amenities.bathrooms", {
                setValueAs: (v) =>
                  v === "" || v == null ? undefined : Number(v),
              })}
              placeholder="0"
            />
            {errors.single_property_details?.amenities?.bathrooms && (
              <p className="text-sm text-red-500 mt-1">
                {errors.single_property_details?.amenities.bathrooms.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities.parking_spaces">Parking Spaces</Label>
            <Input
              id="amenities.parking_spaces"
              type="number"
              min="0"
              {...register("single_property_details.amenities.parking_spaces", {
                setValueAs: (v) =>
                  v === "" || v == null ? undefined : Number(v),
              })}
              placeholder="0"
            />
            {errors.single_property_details?.amenities?.parking_spaces && (
              <p className="text-sm text-red-500 mt-1">
                {errors.single_property_details?.amenities.parking_spaces.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities.balconies">Balconies/Patios</Label>
            <Input
              id="amenities.balconies"
              type="number"
              min="0"
              {...register("single_property_details.amenities.balconies", {
                setValueAs: (v) =>
                  v === "" || v == null ? undefined : Number(v),
              })}
              placeholder="0"
            />
            {errors.single_property_details?.amenities?.balconies && (
              <p className="text-sm text-red-500 mt-1">
                {errors.single_property_details?.amenities.balconies.message}
              </p>
            )}
          </div>
        </div>

        {/* Boolean Amenities using Controller */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Additional Features</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.swimming_pool"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.swimming_pool"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.swimming_pool" className="text-sm">
                Swimming Pool
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.gym"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.gym"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.gym" className="text-sm">
                Gym/Fitness Center
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.air_conditioning"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.air_conditioning"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.air_conditioning" className="text-sm">
                Air Conditioning
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.heating"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.heating"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.heating" className="text-sm">
                Heating System
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.laundry_in_unit"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.laundry_in_unit"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.laundry_in_unit" className="text-sm">
                In-Unit Laundry
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.dishwasher"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.dishwasher"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.dishwasher" className="text-sm">
                Dishwasher
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.fireplace"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.fireplace"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.fireplace" className="text-sm">
                Fireplace
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.storage_space"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.storage_space"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.storage_space" className="text-sm">
                Storage Space
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.pet_friendly"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.pet_friendly"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.pet_friendly" className="text-sm">
                Pet Friendly
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.security_system"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.security_system"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.security_system" className="text-sm">
                Security System
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.elevator"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.elevator"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.elevator" className="text-sm">
                Elevator Access
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="single_property_details.amenities.garden_yard"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="amenities.garden_yard"
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="amenities.garden_yard" className="text-sm">
                Garden/Yard
              </Label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
