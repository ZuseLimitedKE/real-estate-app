"use client"

import { PropertyType } from "@/constants/properties";
import React, { createContext, useState } from "react";
import z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { createPropertySchema } from "@/types/property";
import { zodResolver } from "@hookform/resolvers/zod";
import CreatePropertyStep1Form from "./steps/step1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApartmentEstateDetailsForm from "./steps/appartments/step1";
import ApartmentDocumentsForm from "./steps/appartments/step2";
import ApartmentUnitTemplatesForm from "./steps/appartments/step3";
import ApartmentUnitsForm from "./steps/appartments/step4";
import { BookTemplate, File, HouseIcon, HousePlus, LucideIcon, Mouse } from "lucide-react";
import CreatePropertyFormProgress from "./progress_indicator";

interface MultiStepFormProps {
    userID: string
}

interface CreatePropertyContextType {
    currentStep: number;
    setCurrentStep: (num: number) => void,
    saveFormState: (step: number) => void,
    steps: Steps[]
}

interface Steps {
    num: number,
    item: React.ReactElement,
    title: string,
    icon: LucideIcon
}

const step1: Steps = {
    num: 1,
    item: <CreatePropertyStep1Form />,
    title: "Select property type",
    icon: Mouse
};

const apartmentSteps: Steps[] = [
    step1,
    {
        num: 2,
        item: <ApartmentEstateDetailsForm />,
        title: "Apartment Estate Details",
        icon: HousePlus
    },
    {
        num: 3,
        item: <ApartmentDocumentsForm />,
        title: "Apartment Documents",
        icon: File
    },
    {
        num: 4,
        item: <ApartmentUnitTemplatesForm />,
        title: "Apartment Unit Templates",
        icon: BookTemplate
    },
    {
        num: 5,
        item: <ApartmentUnitsForm />,
        title: "Apartment Units",
        icon: HouseIcon
    }
];

const singlePropertySteps: Steps[] = [
    step1,
]

export const CreatePropertyContext = createContext<CreatePropertyContextType | null>(null);

export default function MultiStepForm({ userID }: MultiStepFormProps) {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const form = useForm<z.infer<typeof createPropertySchema>>({
        resolver: zodResolver(createPropertySchema),
        defaultValues: {
            property_type: undefined
        }
    });

    const saveFormState = (step: number) => {
        console.log(step);
    }

    const propertyType = form.getValues('property_type');
    const steps = propertyType === undefined || propertyType === null ? [step1] : propertyType === PropertyType.APARTMENT ? apartmentSteps : singlePropertySteps;

    const value: CreatePropertyContextType = {
        currentStep,
        setCurrentStep,
        saveFormState,
        steps
    }

    const currentForm = steps.find((s) => s.num === currentStep + 1);

    return (
        <CreatePropertyContext value={value}>
            <FormProvider {...form}>
                {currentForm && (
                    <form className="space-y-6 max-w-4xl mx-auto p-6">
                        <Card>
                            <CardHeader>
                                <CreatePropertyFormProgress />
                                <CardTitle>{currentForm.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentForm.item}
                                {/* Page controls */}
                            </CardContent>
                        </Card>
                    </form>
                )}
            </FormProvider>
        </CreatePropertyContext>
    );
}