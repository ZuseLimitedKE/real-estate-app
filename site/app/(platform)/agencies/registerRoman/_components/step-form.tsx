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

interface MultiStepFormProps {
    userID: string
}

interface CreatePropertyContextType {
    currentStep: number;
    type: PropertyType | null;
    setCurrentStep: (num: number) => void,
    saveFormState: (step: number) => void,
}

interface Steps {
    num: number,
    item: React.ReactElement
}

export const CreatePropertyContext = createContext<CreatePropertyContextType | null>(null);

export default function MultiStepForm({ userID }: MultiStepFormProps) {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [propertyType, setPropertyType] = useState<PropertyType | null>(null);

    const saveFormState = (step: number) => {
        console.log(step);
    }

    const value: CreatePropertyContextType = {
        currentStep,
        type: propertyType,
        setCurrentStep,
        saveFormState
    }

    const form = useForm<z.infer<typeof createPropertySchema>>({
        resolver: zodResolver(createPropertySchema)
    })

    return (
        <CreatePropertyContext value={value}>
            <FormProvider {...form}>
                <form className="space-y-6 max-w-4xl mx-auto p-6">
                    <Card>
                        <CardHeader>
                            {/* Progress indicator */}
                            <CardTitle>{"Test Title"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {<ApartmentDocumentsForm /> }
                            {/* Page controls */}
                        </CardContent>
                    </Card>
                </form>
            </FormProvider>
        </CreatePropertyContext>
    );
}