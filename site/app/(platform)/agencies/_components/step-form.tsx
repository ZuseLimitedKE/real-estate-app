import { addPropertySchema, AddPropertyFormData } from "@/types/property";
import { createContext, useState } from "react";
import { FormStep, MultiStepFormContextProps } from "@/types/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddProperty } from "@/server-actions/property/add-property";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Asul } from "next/font/google";
export const MultiStepFormContext =
  createContext<MultiStepFormContextProps | null>(null);
interface MultiStepFormProps {
  steps: FormStep[];
}

export const MultiStepForm = ({ steps }: MultiStepFormProps) => {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const form = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      name: "",
      description: "",
      amenities: {
        bed: null,
        bath: null,
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
      agencyId: "randomId",
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
  });
  //Navigation controls
  const nextStep = async () => {
    const isValid = await form.trigger(currentStep.fields);

    if (!isValid) {
      return; // Stop progression if validation fails
    }

    // grab values in current step and transform array to object
    const currentStepValues = form.getValues(currentStep.fields);
    const formValues = Object.fromEntries(
      currentStep.fields.map((field, index) => [
        field,
        currentStepValues[index] || "",
      ]),
    );

    // Validate the form state against the current step's schema
    if (currentStep.validationSchema) {
      const validationResult =
        currentStep.validationSchema.safeParse(formValues);

      if (!validationResult.success) {
        validationResult.error.issues.forEach((err) => {
          form.setError(err.path.join(".") as keyof AddPropertyFormData, {
            type: "manual",
            message: err.message,
          });
        });
        return; // Stop progression if schema validation fails
      }
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((current) => current + 1);
    }
  };
  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((current) => current - 1);
    }
  };
  const goToStep = (position: number) => {
    if (position >= 0 && position - 1 < steps.length) {
      setCurrentStepIndex(position - 1);
      // saveFormState(position - 1)
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
      form.reset();
    } catch (err) {
      toast.error(
        "Unable to submit this property for review. Please try again later",
      );
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
    goToStep,
    nextStep,
    previousStep,
    steps,
  };
  return (
    <MultiStepFormContext.Provider value={value}>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 max-w-4xl mx-auto p-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{currentStep.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep.component}
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </MultiStepFormContext.Provider>
  );
};
