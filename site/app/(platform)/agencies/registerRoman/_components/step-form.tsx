"use client"

import { PropertyType } from "@/constants/properties";
import React, { createContext, useEffect, useState } from "react";
import z, { ZodType } from "zod";
import { DefaultValues, FormProvider, Path, useForm } from "react-hook-form";
import { appartmentStepSchemas, createPropertySchema, CreatePropertyType, propertyTypeSchema, stepSchemas } from "@/types/property";
import { zodResolver } from "@hookform/resolvers/zod";
import CreatePropertyStep1Form from "./steps/step1";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApartmentEstateDetailsForm from "./steps/appartments/step1";
import ApartmentDocumentsForm from "./steps/appartments/step2";
import ApartmentUnitTemplatesForm from "./steps/appartments/step3";
import ApartmentUnitsForm from "./steps/appartments/step4";
import { BookTemplate, Camera, File, House, HouseIcon, HousePlus, LucideIcon, MapIcon, Mouse, User, Wallet } from "lucide-react";
import CreatePropertyFormProgress from "./progress_indicator";
import PrevButton from "./prev-button";
import NextButton from "./next-button";
import { useLocalStorage } from "@mantine/hooks";
import { SavedFormState } from "@/types/form";
import { MyError } from "@/constants/errors";
import { toast } from "sonner";
import { Step1 } from "./steps/single/step1";
import { Step2 } from "./steps/single/step2";
import { Step3 } from "./steps/single/step3";
import { Step4 } from "./steps/single/step4";
import { Step5 } from "./steps/single/step5";
import { Step6 } from "./steps/single/step6";

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
    fields: Path<CreatePropertyType>[]
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
    {
        num: 2,
        item: <Step1 />,
        title: "Property Information",
        validationSchema: stepSchemas.step1,
        icon: House,
        fields: ["single_property_details.name", "single_property_details.description", "single_property_details.gross_property_size", "single_property_details.amenities"]
    },
    {
        num: 3,
        item: <Step2 />,
        title: "Address Details",
        validationSchema: stepSchemas.step2,
        icon: MapIcon,
        fields: ["single_property_details.location"]
    },
    {
        num: 4,
        item: <Step3 />,
        title: "Tenant Information",
        validationSchema: stepSchemas.step3,
        icon: User,
        fields: ["single_property_details.tenant"]
    },
    {
        num: 5,
        item: <Step4 />,
        title: "Financial Information",
        validationSchema: stepSchemas.step4,
        icon: Wallet,
        fields: ["single_property_details.proposedRentPerMonth", "single_property_details.serviceFeePercent", "single_property_details.property_value"]
    },
    {
        num: 6,
        item: <Step5 />,
        title: "Property Images",
        validationSchema: stepSchemas.step5,
        icon: Camera,
        fields: ["single_property_details.images"]
    },
    {
        num: 7,
        item: <Step6 />,
        title: "Legal Documents",
        validationSchema: stepSchemas.step6,
        icon: File,
        fields: ["single_property_details.documents"]
    }
]

export const CreatePropertyContext = createContext<CreatePropertyContextType | null>(null);

export default function MultiStepForm({ userID }: MultiStepFormProps) {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const defaultValue = {
        propertyType: undefined,
        single_property_details: {
            name: "",
            description: "",
            amenities: {
                bedrooms: null,
                bathrooms: null,
                parking_spaces: null,
                balconies: null,
                swimming_pool: false,
                gym: false,
                air_conditioning: false,
                heating: false,
                laundry_in_unit: false,
                dishwasher: false,
                fireplace: false,
                storage_space: false,
                pet_friendly: false,
                security_system: false,
                elevator: false,
                garden_yard: false,
            },
            location: {
                address: "",
                coordinates: {
                    lat: -1.286389,
                    lng: 36.817223,
                },
            },
            images: [],
            documents: [],
            property_status: "pending" as const,
            agencyId: userID,
            token_address: "randomAddress",
            proposedRentPerMonth: 0,
            serviceFeePercent: 10,
            property_value: 0,
            gross_property_size: 0,
            tenant: undefined,
            time_listed_on_site: Date.now(),
            property_owners: [],
            secondary_market_listings: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
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
            console.log("Converted data", convertedData);
            form.reset(convertedData);
        }
    }, [form, savedFormState]);

    const convertDataFromStorage = (
        raw: unknown,
    ): DefaultValues<CreatePropertyType> => {
        const data = (raw ?? {}) as Record<string, any>;
        return {
            property_type: data.property_type ?? defaultValue.propertyType,
            apartment_property_details: {
                location: data.apartment_property_details.location ?? defaultValue.apartment_property_details.location,
                documents: data.apartment_property_details.documents ?? [],
                unit_templates: data.apartment_property_details.unit_templates ?? [],
                units: data.apartment_property_details.units ?? [],
                name: data.apartment_property_details.name ?? "",
                description: data.apartment_property_details.description ?? "",
                parking_spaces: data.apartment_property_details.parking_spaces ?? 0,
                serviceFeePercent: data.apartment_property_details.serviceFeePercent ?? 0,
                floors: data.apartment_property_details.floors ?? 0,
            },
            single_property_details: {
                ...data?.single_property_details,
                amenities: data?.single_property_details?.amenities ?? defaultValue.single_property_details.amenities,
                createdAt: data?.single_property_details?.createdAt ? new Date(data.createdAt) : undefined,
                updatedAt: data?.single_property_details?.updatedAt ? new Date(data.updatedAt) : undefined,
                tenant: data?.single_property_details?.tenant ?? undefined,
                property_owners: Array.isArray(data?.single_property_details?.property_owners)
                    ? data?.single_property_details?.property_owners.map((owner: any) => ({
                        ...owner,
                        purchase_time: owner?.purchase_time
                            ? new Date(owner.purchase_time)
                            : undefined,
                    }))
                    : [],
                images: data?.single_property_details?.images ?? [],
                documents: data?.single_property_details?.documents ?? [],
                secondary_market_listings: data?.single_property_details?.secondary_market_listings ?? [],
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
                    let key: string = field;
                    if (field.startsWith('apartment_property_details') || field.startsWith('single_property_details')) {
                        let components = field.split('.').slice(1);
                        key = components.join('.');
                    }

                    return [
                        key,
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
        console.log("Previous state")
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