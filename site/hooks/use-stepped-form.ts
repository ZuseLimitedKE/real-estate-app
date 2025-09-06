// src/hooks/use-stepped-form.ts
import { MultiStepFormContext } from "@/app/(platform)/agencies/_components/step-form";
import { useContext } from "react";

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error(
      "useMultiStepForm must be used within MultiStepForm.Provider",
    );
  }
  return context;
};
