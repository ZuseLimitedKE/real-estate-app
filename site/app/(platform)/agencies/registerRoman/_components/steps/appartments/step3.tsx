import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatePropertyType } from "@/types/property";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import ApartmentUnitTemplateAmenities from "./step3Amenities";
import ApartmentUnitTemplateImages from "./step3Images";
import ApartmentCreatedUnitTemplate from "./step3CreatedTemplate";

export default function ApartmentUnitTemplatesForm() {
    const {
        register,
        formState: { errors },
        control,
    } = useFormContext<CreatePropertyType>();

    const { fields: unitTemplates } = useFieldArray({
        control,
        name: "apartment_property_details.unit_templates"
    })


    return (
        <section className="space-y-4">
            <p className="text-sm text-slate-500">
                A unit template describes the kind of unit that you have in your estate.
                For example, if your estate has a lot of 1 bedroom units you can create
                a template that describes what this 1 bedroom unit has. This is to make
                registering many units in the system easier.
            </p>

            {/* Display Created Templates */}
            <section className="bg-slate-200 rounded-md p-2 space-y-4">
                <h3>Created Unit Templates</h3>

                <div className="flex gap-2 flex-wrap">
                    {unitTemplates.map((template) => (
                        <ApartmentCreatedUnitTemplate 
                            {...template}
                        />
                    ))}
                </div>
            </section>

            {/* Adding a template */}
            <section className="p-2 rounded-md border">
                <h3>Add Unit Template</h3>

                <section className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="template_name">Template Name</Label>
                        <Input
                            id="template_name"
                            {...register(`apartment_property_details.unit_templates.${unitTemplates.length}.name`)}
                            placeholder="Enter the name of the apartment estate"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplates.length]?.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.apartment_property_details?.unit_templates?.[unitTemplates.length]?.name?.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gross_unit_size">Unit Size (sq ft)</Label>
                        <Input
                            id="gross_unit_size"
                            type="number"
                            step="0.01"
                            {...register(`apartment_property_details.unit_templates.${unitTemplates.length}.gross_unit_size`, {
                                valueAsNumber: true,
                            })}
                            placeholder="0.00"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplates.length]?.gross_unit_size && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.apartment_property_details?.unit_templates?.[unitTemplates.length]?.gross_unit_size?.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit_value">Unit Value (KSH)</Label>
                        <Input
                            id="unit_value"
                            type="number"
                            min="0"
                            {...register(`apartment_property_details.unit_templates.${unitTemplates.length}.unit_value`, { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplates.length]?.unit_value && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.apartment_property_details?.unit_templates?.[unitTemplates.length]?.unit_value?.message}
                            </p>
                        )}
                    </div>

                    <ApartmentUnitTemplateImages />

                    <ApartmentUnitTemplateAmenities />
                </section>
            </section>
        </section>
    );
}