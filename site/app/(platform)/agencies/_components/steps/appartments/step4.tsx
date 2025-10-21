import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatePropertyType, unitSchema } from "@/types/property";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import CreatedApartmentUnits from "./step4Units";
import { Button } from "@/components/ui/button";
import { useCreatePropertyForm } from "@/hooks/use-stepped-form";

export default function ApartmentUnitsForm() {
  const {
    register,
    watch,
    control,
    formState: { errors },
    setError,
  } = useFormContext<CreatePropertyType>();

  const { append, remove } = useFieldArray({
    control,
    name: "apartment_property_details.units",
  });
  const unitTemplates =
    watch("apartment_property_details.unit_templates") ?? [];
  const templates = unitTemplates.map((u) => u.name);
  const units = watch("apartment_property_details.units") ?? [];
  const unitNum = -1;
  const unit = watch(`apartment_property_details.units.${unitNum}`);
  const { saveFormState, currentStep } = useCreatePropertyForm();

  return (
    <section className="space-y-4">
      <p className="text-sm text-slate-500">
        Register a new unit by entering its name, the floor on the apartment
        building that it's on and the template that describes the unit
      </p>

      <section className="bg-slate-200 rounded-md p-2 space-y-4">
        <h3>Registered Units</h3>

        <div className="flex gap-2 flex-wrap">
          {units.map((u, index) => (
            <CreatedApartmentUnits
              key={index}
              {...u}
              remove={remove}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className="rounded-md p-2 border space-y-4">
        <h3>Register a new unit</h3>

        <section className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="unit_name">Unit Name</Label>
            <Controller
              name={`apartment_property_details.units.${unitNum}.name`}
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Input
                    id="unit_name"
                    {...field}
                    placeholder="Enter the name of the unit e.g 1A"
                  />
                  {errors.apartment_property_details?.units?.[unitNum]
                    ?.name && (
                      <p className="text-sm text-red-500 mt-1">
                        {
                          errors.apartment_property_details?.units?.[unitNum]
                            ?.name?.message
                        }
                      </p>
                    )}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_template_name">Unit Template Name</Label>
            <Controller
              name={`apartment_property_details.units.${unitNum}.template_name`}
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a unit template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t, i) => (
                      <SelectItem key={i} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.apartment_property_details?.units?.[unitNum]
              ?.template_name && (
                <p className="text-sm text-red-500 mt-1">
                  {
                    errors.apartment_property_details?.units?.[unitNum]
                      ?.template_name?.message
                  }
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_floor">Unit Floor</Label>
            <Input
              id="unit_floor"
              type="number"
              min="1"
              {...register(
                `apartment_property_details.units.${unitNum}.floor`,
                { valueAsNumber: true },
              )}
              placeholder="1"
            />
            {errors.apartment_property_details?.units?.[unitNum]?.floor && (
              <p className="text-sm text-red-500 mt-1">
                {
                  errors.apartment_property_details?.units?.[unitNum]?.floor
                    ?.message
                }
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              const parsed = unitSchema.safeParse(unit);
              if (parsed.success) {
                append(parsed.data);
                saveFormState(currentStep);
              } else {
                for (const error of parsed.error.issues) {
                  if (error.path.includes("name")) {
                    setError(
                      `apartment_property_details.units.${unitNum}.name`,
                      {
                        type: "manual",
                        message: error.message,
                      },
                    );
                  }

                  if (error.path.includes("template_name")) {
                    setError(
                      `apartment_property_details.units.${unitNum}.template_name`,
                      {
                        type: "manual",
                        message: error.message,
                      },
                    );
                  }

                  if (error.path.includes("floor")) {
                    setError(
                      `apartment_property_details.units.${unitNum}.floor`,
                      {
                        type: "manual",
                        message: error.message,
                      },
                    );
                  }
                }
              }
            }}
          >
            Add Unit
          </Button>
        </section>
      </section>
    </section>
  );
}
