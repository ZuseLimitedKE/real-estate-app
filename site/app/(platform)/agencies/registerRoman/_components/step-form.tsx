"use client"

import { PropertyType } from "@/constants/properties";
import React, { createContext, useState } from "react";
import z, { number } from "zod";
import PropertiesStep1Form from "./steps/single/step1";
import PropertiesStep2Form from "./steps/single/step2";
import ApartmentStep1Form from "./steps/appartments/step1";
import ApartmentStep2Form from "./steps/appartments/step2";
import { Button } from "@/components/ui/button";
import CreatePropertyFormProgress from "./progress_indicator";
import { FormProvider, useForm } from "react-hook-form";
import { createPropertySchema } from "@/types/property";
import { zodResolver } from "@hookform/resolvers/zod";

interface MultiStepFormProps {
    userID: string
}

interface CreatePropertyContextType {
    currentStep: number;
    type: PropertyType | null;
    setCurrentStep: (num: number) => void,

}

interface Steps {
    num: number,
    item: React.ReactElement
}

export const propertySteps: Steps[] = [
    {
        num: 1,
        item: <PropertiesStep1Form />
    },
    {
        num: 2,
        item: <PropertiesStep2Form />
    }
];

export const appartmentsteps: Steps[] = [
    {
        num: 1,
        item: <ApartmentStep1Form />
    },
    {
        num: 2,
        item: <ApartmentStep2Form />
    }
]

export const CreatePropertyContext = createContext<CreatePropertyContextType | null>(null);

export default function MultiStepForm({ userID }: MultiStepFormProps) {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [propertyType, setPropertyType] = useState<PropertyType | null>(null);

    const value: CreatePropertyContextType = {
        currentStep,
        type: propertyType,
        setCurrentStep
    }

    const form = useForm<z.infer<typeof createPropertySchema>>({
        resolver: zodResolver(createPropertySchema)
    })

    return (
        <CreatePropertyContext value={value}>
            <FormProvider {...form}>
                
            </FormProvider>
        </CreatePropertyContext>
    );
}