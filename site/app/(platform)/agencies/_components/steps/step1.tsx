import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PropertyType } from "@/constants/properties";
import { CreatePropertyType } from "@/types/property";
import { Controller, useFormContext } from "react-hook-form";

export default function CreatePropertyStep1Form() {
    const {
        register,
        control,
        formState: { errors }
    } = useFormContext<CreatePropertyType>();

    return (
        <section className="space-y-2">
            <Controller
                name="property_type"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                        <Label htmlFor="property_type">What type of property are you creating?</Label>
                        <RadioGroup
                            id="property_type"
                            value={field.value}
                            className="flex flex-row flex-wrap gap-4 items-center"
                            onValueChange={field.onChange}
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value={PropertyType.SINGLE} id="r1" />
                                <Label htmlFor="r1">Single</Label>
                            </div>
                            {/* <div className="flex items-center gap-3">
                                <RadioGroupItem value={PropertyType.APARTMENT} id="r2" />
                                <Label htmlFor="r2">Apartment</Label>
                            </div> */}
                        </RadioGroup>
                        {errors.property_type && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.property_type.message}
                            </p>
                        )}
                    </div>
                )}
            />

        </section>
    );
}