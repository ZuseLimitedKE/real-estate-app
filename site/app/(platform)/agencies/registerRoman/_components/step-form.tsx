"use client"

import { PropertyType } from "@/constants/properties";
import React, { createContext, useEffect, useState } from "react";
import z, { ZodType } from "zod";
import { DefaultValues, FormProvider, Path, useForm } from "react-hook-form";
import { appartmentStepSchemas, createPropertySchema, CreatePropertyType, propertyTypeSchema } from "@/types/property";
import { zodResolver } from "@hookform/resolvers/zod";
import CreatePropertyStep1Form from "./steps/step1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApartmentEstateDetailsForm from "./steps/appartments/step1";
import ApartmentDocumentsForm from "./steps/appartments/step2";
import ApartmentUnitTemplatesForm from "./steps/appartments/step3";
import ApartmentUnitsForm from "./steps/appartments/step4";
import { BookTemplate, File, HouseIcon, HousePlus, LucideIcon, Mouse } from "lucide-react";
import CreatePropertyFormProgress from "./progress_indicator";
import PrevButton from "./prev-button";
import NextButton from "./next-button";
import { useLocalStorage } from "@mantine/hooks";
import { SavedFormState } from "@/types/form";
import { MyError } from "@/constants/errors";
import { toast } from "sonner";

interface MultiStepFormProps {
    userID: string
}

interface CreatePropertyContextType {
    currentStep: number;
    setCurrentStep: (num: number) => void,
    saveFormState: (step: number) => void,
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (step: number) => void;
    isFirstStep: boolean,
    isLastStep: boolean,
    isSubmitting: boolean,
    steps: Steps[]
}

interface Steps {
    num: number,
    item: React.ReactElement,
    title: string,
    icon: LucideIcon,
    validationSchema: ZodType<unknown>;
    fields: string[]
}

const step1: Steps = {
    num: 1,
    item: <CreatePropertyStep1Form />,
    title: "Select property type",
    validationSchema: propertyTypeSchema,
    icon: Mouse,
    fields: ["property_type"]
};

const apartmentSteps: Steps[] = [
    step1,
    {
        num: 2,
        item: <ApartmentEstateDetailsForm />,
        title: "Apartment Estate Details",
        validationSchema: appartmentStepSchemas.step1,
        icon: HousePlus,
        fields: ['apartment_property_details.name', 'apartment_property_details.description', 'apartment_property_details.location', 'apartment_property_details.parking_spaces', 'apartment_property_details.serviceFeePercent', 'apartment_property_details.floors']
    },
    {
        num: 3,
        item: <ApartmentDocumentsForm />,
        title: "Apartment Documents",
        validationSchema: appartmentStepSchemas.step2,
        icon: File,
        fields: ['apartment_property_details.documents']
    },
    {
        num: 4,
        item: <ApartmentUnitTemplatesForm />,
        title: "Apartment Unit Templates",
        validationSchema: appartmentStepSchemas.step3,
        icon: BookTemplate,
        fields: ['apartment_property_details.unit_templates']
    },
    {
        num: 5,
        item: <ApartmentUnitsForm />,
        validationSchema: appartmentStepSchemas.step4,
        title: "Apartment Units",
        icon: HouseIcon,
        fields: ['apartment_property_details.units']
    }
];

const singlePropertySteps: Steps[] = [
    step1,
]

export const CreatePropertyContext = createContext<CreatePropertyContextType | null>(null);

export default function MultiStepForm({ userID }: MultiStepFormProps) {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const defaultValue = {
        propertyType: undefined,
        single_property_details: undefined,
        apartment_property_details: {
            name: "",
            description: "",
            location: {
                address: "",
                coordinates: {
                    lat: -1.286389,
                    lng: 36.817223,
                },
            },
            parking_spaces: 0,
            serviceFeePercent: 0,
            floors: 0,
            documents: [],
            unit_templates: [],
            units: []
        }
    }

    const localStorageKey = "add-property-form";
    const [savedFormState, setSavedFormState] =
        useLocalStorage<SavedFormState | null>({
            key: localStorageKey,
            defaultValue: null,
        });

    const form = useForm<z.infer<typeof createPropertySchema>>({
        resolver: zodResolver(createPropertySchema),
        defaultValues: defaultValue
    });

    // Restore form state from Local Storage
    useEffect(() => {
        if (savedFormState) {
            console.log("Restoring form state:", savedFormState);
            setCurrentStep(savedFormState.currentStepIndex);
            const convertedData = convertDataFromStorage(savedFormState.formValues);
            form.reset(convertedData);
        }
    }, [form, savedFormState]);

    const convertDataFromStorage = (
        raw: unknown,
    ): DefaultValues<CreatePropertyType> => {
        const data = (raw ?? {}) as Record<string, any>;
        return {
            ...data,
            property_type: data.property_type ?? defaultValue.propertyType,
            apartment_property_details: {
                location: data.location ?? defaultValue.apartment_property_details.location,
                documents: data.documents ?? [],
                unit_templates: data.unit_templates ?? [],
                units: data.units ?? []
            }
        };
    };

    const saveFormState = (stepIndex: number) => {
        const formValues = form.getValues();
        console.log("Saved form state", formValues);
        setSavedFormState({
            currentStepIndex: stepIndex ?? currentStep,
            formValues: formValues,
        });
    };

    const clearFormState = () => {
        console.log("Clearing form state...");

        window.localStorage.removeItem(localStorageKey);

        setSavedFormState(null);
        setCurrentStep(0);
        form.reset(defaultValue);
        setTimeout(() => {
            console.log(
                "Form state cleared, localStorage:",
                window.localStorage.getItem(localStorageKey),
            );
        }, 400);
    };

    const propertyType = form.watch('property_type');
    const steps = propertyType === undefined || propertyType === null ? [step1] : propertyType === PropertyType.APARTMENT ? apartmentSteps : singlePropertySteps;
    const currentForm = steps.find((s) => s.num === currentStep + 1);

    const onSubmit = async (data: CreatePropertyType) => {
        setIsSubmitting(true);
        try {
            console.log(data);
            toast.success(
                "The property is under review ,we will get back to you shortly",
            );
            clearFormState();
        } catch (err) {
            if (err instanceof MyError) {
                toast.error(err.message);
            } else {
                toast.error(
                    "Unable to submit this property for review. Please try again later",
                );
            }
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    }

    //Navigation controls
    const nextStep = async () => {
        if (currentForm) {
            const isValid = await form.trigger(currentForm.fields);

            if (!isValid) {
                console.log(form.formState.errors);
                return;
            }

            // Grab values and validate current step
            const currentStepValues = form.getValues(currentForm.fields);
            const formValues = Object.fromEntries(
                currentForm.fields.map((field, index) => {
                    if (field.startsWith('apartment_property_details')) {
                        let components = field.split('.').slice(1);
                        field = components.join('.');
                    }

                    return [
                        field,
                        currentStepValues[index] || "",
                    ]
                }),
            );
            console.log("Next button field", formValues);

            if (currentForm.validationSchema) {
                console.log("Validation schema there");
                const validationResult =
                    currentForm.validationSchema.safeParse(formValues);
                console.log("Validation result", validationResult);
                if (!validationResult.success) {
                    console.log("Not valid");
                    validationResult.error.issues.forEach((err) => {
                        form.setError(err.path.join(".") as Path<CreatePropertyType>, {
                            type: "manual",
                            message: err.message,
                        });
                    });
                    return;
                }
            }

            // If this is the last step, submit the form instead of navigating
            if (currentStep === steps.length - 1) {
                // Trigger form submission manually
                const formData = form.getValues();
                await onSubmit(formData);
                return;
            }

            // Otherwise, navigate to next step
            console.log("Current step", currentStep, "Total steps", steps.length);
            if (currentStep < steps.length - 1) {
                console.log("ran");
                saveFormState(currentStep + 1);
                setCurrentStep((current) => current + 1);
            }
        } else {
            console.log("No current form");
        }
    };
    const previousStep = () => {
        if (currentStep > 0) {
            saveFormState(currentStep - 1);
            setCurrentStep((current) => current - 1);
        }
    };
    const goToStep = (position: number) => {
        if (position >= 1 && position <= steps.length) {
            const newStepIndex = position - 1;
            setCurrentStep(newStepIndex);
            saveFormState(newStepIndex);
        } else {
            console.warn(
                `Invalid step position: ${position}. Must be between 1 and ${steps.length}`,
            );
        }
    };

    const value: CreatePropertyContextType = {
        currentStep,
        setCurrentStep,
        saveFormState,
        steps,
        goToStep,
        nextStep,
        previousStep,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === steps.length - 1 && (propertyType !== null && propertyType !== undefined),
        isSubmitting
    }

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
                                <div className="flex flex-col mt-8  w-full md:justify-center md:flex-row  gap-4">
                                    {currentStep > 0 && <PrevButton />}
                                    <NextButton />
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </FormProvider>
        </CreatePropertyContext>
    );
}