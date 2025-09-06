import { ZodType } from "zod";
import { LucideIcon } from "lucide-react";
import type { AddPropertyFormData } from "./property";

type FieldKeys = keyof AddPropertyFormData;

export type FormStep = {
  title: string;
  position: number;
  validationSchema: ZodType<unknown>;
  component: React.ReactElement;
  icon: LucideIcon;
  fields: FieldKeys[];
};
export interface MultiStepFormContextProps {
  currentStep: FormStep;
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  steps: FormStep[];
}
