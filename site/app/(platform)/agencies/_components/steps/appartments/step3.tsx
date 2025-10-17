import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatePropertyType, unitTemplateSchema } from "@/types/property";
import { useFieldArray, useFormContext } from "react-hook-form";
import ApartmentUnitTemplateAmenities from "./step3Amenities";
import ApartmentUnitTemplateImages from "./step3Images";
import ApartmentCreatedUnitTemplate from "./step3CreatedTemplate";
import { Button } from "@/components/ui/button";
import { useCreatePropertyForm } from "@/hooks/use-stepped-form";

export default function ApartmentUnitTemplatesForm() {
    const {
        register,
        formState: { errors },
        control,
        watch,
        setError
    } = useFormContext<CreatePropertyType>();
    const { saveFormState, currentStep } = useCreatePropertyForm();
    const unitTemplates = watch("apartment_property_details.unit_templates");
    const unitTemplateNum = -1;
    const unitTemplate = watch(`apartment_property_details.unit_templates.${unitTemplateNum}`);
    const { append, remove } = useFieldArray({
        control,
        name: "apartment_property_details.unit_templates"
    });


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
                    {unitTemplates.map((template, index) => (
                        <ApartmentCreatedUnitTemplate
                            key={index}
                            {...template}
                            remove={remove}
                            index={index}
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
                            {...register(`apartment_property_details.unit_templates.${unitTemplateNum}.name`)}
                            placeholder="Enter the name of the apartment estate"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.name?.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gross_unit_size">Unit Size (sq ft)</Label>
                        <Input
                            id="gross_unit_size"
                            type="number"
                            step="0.01"
                            {...register(`apartment_property_details.unit_templates.${unitTemplateNum}.gross_unit_size`, {
                                valueAsNumber: true,
                            })}
                            placeholder="0.00"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.gross_unit_size && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.gross_unit_size?.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit_template_proposedRentPerMonth">
                            Proposed Monthly Rent (KSH)
                        </Label>
                        <Input
                            id="unit_template_proposedRentPerMonth"
                            type="number"
                            min="0"
                            {...register(`apartment_property_details.unit_templates.${unitTemplateNum}.proposedRentPerMonth`, {
                                valueAsNumber: true,
                            })}
                            placeholder="0.00"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.proposedRentPerMonth && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.proposedRentPerMonth.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="unit_value">Unit Value (KSH)</Label>
                        <Input
                            id="unit_value"
                            type="number"
                            min="0"
                            {...register(`apartment_property_details.unit_templates.${unitTemplateNum}.unit_value`, { valueAsNumber: true })}
                            placeholder="0.00"
                        />
                        {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.unit_value && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.apartment_property_details?.unit_templates?.[unitTemplateNum]?.unit_value?.message}
                            </p>
                        )}
                    </div>

                    <ApartmentUnitTemplateImages unitTemplatesLength={unitTemplateNum} />

                    <ApartmentUnitTemplateAmenities unitTemplatesLength={unitTemplateNum} />

                    <Button
                        type="button"
                        onClick={() => {
                            const parsed = unitTemplateSchema.safeParse(unitTemplate);
                            if (parsed.success) {
                                console.log("Parse success");
                                append(parsed.data);
                                saveFormState(currentStep);
                            } else {
                                console.log("Parse error", parsed.error.issues);
                                for (const error of parsed.error.issues) {
                                    if (error.path.includes("name")) {
                                        setError(`apartment_property_details.unit_templates.${unitTemplateNum}.name`, {
                                            type: "manual",
                                            message: error.message
                                        })
                                    }

                                    if (error.path.includes("gross_unit_size")) {
                                        setError(`apartment_property_details.unit_templates.${unitTemplateNum}.gross_unit_size`, {
                                            type: "manual",
                                            message: error.message,
                                        })
                                    }

                                    if (error.path.includes("unit_value")) {
                                        console.log("This is called");
                                        setError(`apartment_property_details.unit_templates.${unitTemplateNum}.unit_value`, {
                                            type: "manual",
                                            message: error.message
                                        })
                                    }
                                }
                            }
                        }}
                    >
                        Add Unit Template
                    </Button>
                </section>
            </section>
        </section>
    );
}