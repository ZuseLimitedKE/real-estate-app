import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddPropertyFormData } from "@/types/property"
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form"

export const ApartmentDetailsStep = () => {
    const {
        register,
        control,
        setValue,
        watch,
        formState: { errors }
    } = useFormContext<AddPropertyFormData>();

    const numUnits = watch('apartmentDetails.numUnits');

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "apartmentDetails.units"
    });

    useEffect(() => {
        if (numUnits && numUnits > 0) {
            const currentUnitsCount = fields.length;

            if (numUnits > currentUnitsCount) {
                // Add more units
                const unitsToAdd = numUnits - currentUnitsCount;
                for (let i = 0; i < unitsToAdd; i++) {
                    append({ name: "" });
                }
            } else if (numUnits < currentUnitsCount) {
                // Remove excess units
                const newUnits = fields.slice(0, numUnits);
                replace(newUnits);
            }
        } else {
            // Clear all units if no number is selected
            replace([]);
        }
    }, [numUnits, fields.length, append, replace]);

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="apartmentDetails.floors">Number of floors</Label>
                <Input
                    id="apartmentDetails.floors"
                    type="number"
                    {...register("apartmentDetails.floors", {valueAsNumber: true})}
                    placeholder="Enter the number of floors in your appartment"
                />
                {errors.apartmentDetails?.floors && (
                    <p className="text-sm text-red-500 mt-1">{errors.apartmentDetails?.floors.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="apartmentDetails.parkingSpace">Total number of parking spaces</Label>
                <Input
                    id="apartmentDetails.parkingSpaces"
                    type="number"
                    {...register("apartmentDetails.parkingSpace", {valueAsNumber: true})}
                    placeholder="Enter total number of parking spaces in the apartment"
                />
                {errors.apartmentDetails?.parkingSpace && (
                    <p className="text-sm text-red-500 mt-1">{errors.apartmentDetails?.parkingSpace.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="numUnits">How many units are in the apartment</Label>
                <Input
                    id="numUnits"
                    type="number"
                    {...register("apartmentDetails.numUnits", {valueAsNumber: true})}
                    placeholder="Enter number of units in the apartment"
                />
                {errors.apartmentDetails?.numUnits && (
                    <p className="text-sm text-red-500 mt-1">{errors.apartmentDetails?.numUnits.message}</p>
                )}
            </div>

            {numUnits && numUnits > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Unit Details</h3>
                        <span className="text-sm text-gray-500">
                            {fields.length} of {numUnits} units
                        </span>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">Unit {index + 1}</h4>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                remove(index);
                                                // Update the number of units to match the new count
                                                setValue("apartmentDetails.numUnits", fields.length - 1);
                                            }}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Remove this unit"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`apartmentDetails.units.${index}.name`}
                                        >
                                            Unit Name
                                        </Label>
                                        <Input
                                            id={`apartmentDetails.units.${index}.name`}
                                            {...register(`apartmentDetails.units.${index}.name`)}
                                            placeholder={`e.g., Unit ${String.fromCharCode(65 + index)}, Master Suite`}
                                        />
                                        {errors.apartmentDetails?.units?.[index]?.name && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {errors.apartmentDetails.units[index]?.name?.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* General error for units array */}
                    {errors.apartmentDetails?.units && (
                        <p className="text-red-500 text-sm">
                            {errors.apartmentDetails.units.message}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}