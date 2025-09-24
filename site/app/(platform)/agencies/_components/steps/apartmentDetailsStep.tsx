import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddPropertyFormData } from "@/types/property"
import { useFormContext } from "react-hook-form"

export const ApartmentDetailsStep = () => {
    const {
        register,
        control,
        formState: { errors }
    } = useFormContext<AddPropertyFormData>();

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="floors">Number of floors</Label>
                <Input
                    id="apartmentDetails.floors"
                    type="number"
                    {...register("apartmentDetails.floors")}
                    placeholder="Enter the number of floors in your appartment"
                />
                {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">

            </div>

            <div className="space-y-2">

            </div>
        </>
    );
}