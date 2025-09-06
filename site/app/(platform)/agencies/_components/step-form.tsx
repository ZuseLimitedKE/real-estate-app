import { addPropertySchema, AddPropertyFormData } from "@/types/property";
import { createContext, useState } from "react";
import { FormStep, MultiStepFormContextProps } from "@/types/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddProperty } from "@/server-actions/property/add-property";
import { toast } from "sonner";
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
  const nextStep = () => {
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
  return <div></div>;
};
