import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CreatePropertyType } from "@/types/property";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { useFieldArray, useFormContext } from "react-hook-form";
import CreatedApartmentUnits from "./step4Units";

export default function ApartmentUnitsForm() {
    const {
        control,
        register,
        formState: { errors }
    } = useFormContext<CreatePropertyType>();

    const { fields: units } = useFieldArray({
        control,
        name: "apartment_property_details.units"
    });

    const templates = units.map((u) => u.template_name);

    return (
        <section className="space-y-4">
            <p className="text-sm text-slate-500">
                Register a new unit by entering its name, the floor on the apartment
                building that it's on and the template that describes the unit
            </p>

            <section className="bg-slate-200 rounded-md p-2 space-y-4">
                <h3>Registered Units</h3>

                <div className="flex gap-2 flex-wrap">
                    {units.map((u) => (
                        <CreatedApartmentUnits 
                            {...u}
                        />
                    ))}
                </div>
            </section>


            <section className="rounded-md p-2 border space-y-4">
                <h3>Register a new unit</h3>

                <section className="space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="unit_name">Unit Name</Label>
                        <Input 
                            id="unit_name"
                            {...register(`apartment_property_details.units.${units.length}.name`)}
                            placeholder="Enter the name of the unit e.g 1A"
                        />
                        {errors.apartment_property_details?.units?.[units.length]?.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.apartment_property_details?.units?.[units.length]?.name?.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit_template_name">Unit Template Name</Label>
                        <Select
                            {...register(`apartment_property_details.units.${units.length}.template_name`)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a unit template"/>
                            </SelectTrigger>

                            <SelectContent>
                                {templates.map((t) => (
                                    <SelectItem value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit_floor">Unit Floor</Label>
                        <Input
                            id="unit_floor"
                            type="number"
                            min="0"
                            {...register(`apartment_property_details.units.${units.length}.floor`, { valueAsNumber: true })}
                            placeholder="0"
                        />
                        {errors.apartment_property_details?.units?.[units.length]?.floor && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.apartment_property_details?.units?.[units.length]?.floor?.message}
                            </p>
                        )}
                    </div>
                </section>
            </section>
        </section>
    );
}