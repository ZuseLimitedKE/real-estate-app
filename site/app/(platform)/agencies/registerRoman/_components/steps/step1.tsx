import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PropertyType } from "@/constants/properties";
import { CreatePropertyType } from "@/types/property";
import { useFormContext } from "react-hook-form";

export default function CreatePropertyStep1Form() {
    const {
        register,
        formState: { errors }
    } = useFormContext<CreatePropertyType>();

    return (
        <section className="space-y-2">
            <Label htmlFor="property_type">What type of property are you creating?</Label>
            <RadioGroup
                defaultValue={PropertyType.SINGLE}
                {...register("property_type")}
                id="property_type"
            >
                <div className="flex items-center gap-3">
                    <RadioGroupItem value={PropertyType.SINGLE} id="property_type_single" />
                    <Label htmlFor="property_type_single">Single Property</Label>
                </div>

                <div className="flex items-center gap-3">
                    <RadioGroupItem value={PropertyType.APARTMENT} id="property_type_apartment" />
                    <Label htmlFor="property_type_apartment">Apartment</Label>
                </div>
            </RadioGroup>
            {errors.property_type && (
                <p className="text-sm text-red-500 mt-1">
                    {errors.property_type.message}
                </p>
            )}
        </section>
    );
}