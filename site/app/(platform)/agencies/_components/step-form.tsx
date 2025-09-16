import { addPropertySchema, AddPropertyFormData } from "@/types/property";
import { createContext, useState, useEffect } from "react";
import type {
  FormStep,
  MultiStepFormContextProps,
  SavedFormState,
} from "@/types/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddProperty } from "@/server-actions/property/add-property";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ProgressIndicator from "./progress-indicator";
import { PrevButton } from "./prev-button";
import { useLocalStorage } from "@mantine/hooks";
import type { DefaultValues, Path } from "react-hook-form";
import { NextButton } from "./next-button";
import { MyError } from "@/constants/errors";
export const MultiStepFormContext =
  createContext<MultiStepFormContextProps | null>(null);
interface MultiStepFormProps {
  userId: string;
  steps: FormStep[];
}

export const MultiStepForm = ({ steps, userId }: MultiStepFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const localStorageKey = "add-property-form";
  const defaultValues = {
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
    agencyId: userId,
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
  };
  const [savedFormState, setSavedFormState] =
    useLocalStorage<SavedFormState | null>({
      key: localStorageKey,
      defaultValue: null,
    });
  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: defaultValues,
  });

  const convertDataFromStorage = (
    raw: unknown,
  ): DefaultValues<AddPropertyFormData> => {
    const data = (raw ?? {}) as Record<string, any>;
    return {
      ...data,
      amenities: data.amenities ?? defaultValues.amenities,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      tenant: data.tenant ?? undefined,
      property_owners: Array.isArray(data.property_owners)
        ? data.property_owners.map((owner: any) => ({
          ...owner,
          purchase_time: owner?.purchase_time
            ? new Date(owner.purchase_time)
            : undefined,
        }))
        : [],
      images: data.images ?? [],
      documents: data.documents ?? [],
      secondary_market_listings: data.secondary_market_listings ?? [],
    };
  };
  // Restore form state from Local Storage
  useEffect(() => {
    if (savedFormState) {
      console.log("Restoring form state:", savedFormState);
      setCurrentStepIndex(savedFormState.currentStepIndex);
      const convertedData = convertDataFromStorage(savedFormState.formValues);
      form.reset(convertedData);
    }
  }, [form, savedFormState]);

  const saveFormState = (stepIndex: number) => {
    const formValues = form.getValues();
    setSavedFormState({
      currentStepIndex: stepIndex ?? currentStepIndex,
      formValues: formValues,
    });
  };

  const clearFormState = () => {
    console.log("Clearing form state...");

    window.localStorage.removeItem(localStorageKey);

    setSavedFormState(null);
    setCurrentStepIndex(0);
    form.reset(defaultValues);
    setTimeout(() => {
      console.log(
        "Form state cleared, localStorage:",
        window.localStorage.getItem(localStorageKey),
      );
    }, 400);
  };
  //Navigation controls
  const nextStep = async () => {
    const isValid = await form.trigger(currentStep.fields);

    if (!isValid) {
      console.log(form.formState.errors);
      return;
    }

    // Grab values and validate current step
    const currentStepValues = form.getValues(currentStep.fields);
    const formValues = Object.fromEntries(
      currentStep.fields.map((field, index) => [
        field,
        currentStepValues[index] || "",
      ]),
    );

    if (currentStep.validationSchema) {
      const validationResult =
        currentStep.validationSchema.safeParse(formValues);
      if (!validationResult.success) {
        validationResult.error.issues.forEach((err) => {
          form.setError(err.path.join(".") as Path<AddPropertyFormData>, {
            type: "manual",
            message: err.message,
          });
        });
        return;
      }
    }

    // If this is the last step, submit the form instead of navigating
    if (currentStepIndex === steps.length - 1) {
      // Trigger form submission manually
      const formData = form.getValues();
      await onSubmit(formData);
      return;
    }

    // Otherwise, navigate to next step
    if (currentStepIndex < steps.length - 1) {
      console.log("ran");
      saveFormState(currentStepIndex + 1);
      setCurrentStepIndex((current) => current + 1);
    }
  };
  const previousStep = () => {
    if (currentStepIndex > 0) {
      saveFormState(currentStepIndex - 1);
      setCurrentStepIndex((current) => current - 1);
    }
  };
  const goToStep = (position: number) => {
    if (position >= 1 && position <= steps.length) {
      const newStepIndex = position - 1;
      setCurrentStepIndex(newStepIndex);
      saveFormState(newStepIndex);
    } else {
      console.warn(
        `Invalid step position: ${position}. Must be between 1 and ${steps.length}`,
      );
    }
  };
  const onSubmit = async (data: AddPropertyFormData) => {
    setIsSubmitting(true);
    try {
      const initialPricePerToken = 100;
      const totalFractions = Math.floor(
        data.property_value / initialPricePerToken,
      );
      await AddProperty({ ...data, totalFractions });
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
  };

  // Context value
  const value: MultiStepFormContextProps = {
    currentStep: steps[currentStepIndex],
    currentStepIndex,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    isSubmitting,
    saveFormState,
    goToStep,
    nextStep,
    previousStep,
    steps,
  };
  return (
    <MultiStepFormContext.Provider value={value}>
      <FormProvider {...form}>
        <form className="space-y-6 max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <ProgressIndicator />
              <CardTitle>{currentStep.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep.component}
              <div className="flex flex-col mt-8  w-full md:justify-center md:flex-row  gap-4">
                {currentStepIndex > 0 && <PrevButton />}
                <NextButton />
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </MultiStepFormContext.Provider>
  );
};
