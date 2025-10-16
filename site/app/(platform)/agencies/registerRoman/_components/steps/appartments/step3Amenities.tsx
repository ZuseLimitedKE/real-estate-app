import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatePropertyType } from "@/types/property";
import { Controller, useFormContext } from "react-hook-form";

export default function ApartmentUnitTemplateAmenities({unitTemplatesLength} : {unitTemplatesLength: number}) {
    const {
        register,
        formState: { errors },
        control,
    } = useFormContext<CreatePropertyType>();

    return (
        <div className="space-y-4">
            <h4>Unit Amenities</h4>

            {/* Countable Amenities */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="unit.amenities.bedrooms">Bedrooms</Label>
                    <Input
                        id="unit.amenities.bedrooms"
                        type="number"
                        min="0"
                        {...register(`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.bedrooms`, {
                            setValueAs: (v) =>
                                v === "" || v == null ? undefined : Number(v),
                        })}
                        placeholder="0"
                    />
                    {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.amenities?.bedrooms && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.amenities?.bedrooms?.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="unit.amenities.bathrooms">Bathrooms</Label>
                    <Input
                        id="unit.amenities.bathrooms"
                        type="number"
                        min="0"
                        step="0.5"
                        {...register(`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.bathrooms`, {
                            setValueAs: (v) =>
                                v === "" || v == null ? undefined : Number(v),
                        })}
                        placeholder="0"
                    />
                    {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.amenities?.bathrooms && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.amenities?.bathrooms?.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="unit.amenities.balconies">Balconies/Patios</Label>
                    <Input
                        id="unit.amenities.balconies"
                        type="number"
                        min="0"
                        {...register(`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.balconies`, {
                            setValueAs: (v) =>
                                v === "" || v == null ? undefined : Number(v),
                        })}
                        placeholder="0"
                    />
                    {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.amenities?.balconies && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.amenities?.balconies?.message}
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
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.gym`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.gym"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.gym" className="text-sm">
                            Gym/Fitness Center
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.air_conditioning`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.air_conditioning"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.air_conditioning" className="text-sm">
                            Air Conditioning
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.heating`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.heating"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.heating" className="text-sm">
                            Heating System
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.laundry_in_unit`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.laundry_in_unit"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.laundry_in_unit" className="text-sm">
                            In-Unit Laundry
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.furnished`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.furnished"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.furnished" className="text-sm">
                            Furnished
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.dishwasher`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.dishwasher"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.dishwasher" className="text-sm">
                            Dishwasher
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.storage_space`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.storage_space"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.storage_space" className="text-sm">
                            Storage Space
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.pet_friendly`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.pet_friendly"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.pet_friendly" className="text-sm">
                            Pet Friendly
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.security_system`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.security_system"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.security_system" className="text-sm">
                            Security System
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.elevator`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.elevator"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.elevator" className="text-sm">
                            Elevator Access
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Controller
                            name={`apartment_property_details.unit_templates.${unitTemplatesLength}.amenities.garden_yard`}
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="unit.amenities.garden_yard"
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="unit.amenities.garden_yard" className="text-sm">
                            Garden/Yard
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );
}