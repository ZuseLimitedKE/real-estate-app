import { useCreatePropertyForm } from "@/hooks/use-stepped-form";
import { appartmentsteps, propertySteps } from "./step-form";
import { Button } from "@/components/ui/button";
import { PropertyType } from "@/constants/properties";

export default function CreatePropertyFormProgress() {
    const createPropertyContext = useCreatePropertyForm()

    if (createPropertyContext.type === null) {
        return (
            <Button>
                1
            </Button>
        )
    } else if (createPropertyContext.type === PropertyType.APARTMENT) {
        const buttons = appartmentsteps.map((a) => {
            if (createPropertyContext.currentStep === a.num) {
                return (
                    <Button
                        onClick={() => createPropertyContext.setCurrentStep(a.num)}
                    >{a.num + 1}</Button>
                )
            }

            return (
                <Button 
                    variant='outline'
                    onClick={() => createPropertyContext.setCurrentStep(a.num)}
                >{a.num + 1}</Button>
            )
        });

        return (
            <div className="flex flex-row gap-4 flex-wrap">
                {buttons}
            </div>
        )
    } else {
        const buttons = propertySteps.map((a) => {
            if (createPropertyContext.currentStep === a.num) {
                return (
                    <Button
                        onClick={() => createPropertyContext.setCurrentStep(a.num)}
                    >{a.num + 1}</Button>
                )
            }

            return (
                <Button 
                    variant='outline'
                    onClick={() => createPropertyContext.setCurrentStep(a.num)}
                >{a.num + 1}</Button>
            )
        });

        return (
            <div className="flex flex-row gap-4 flex-wrap">
                {buttons}
            </div>
        )
    }
}