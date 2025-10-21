// src/hooks/use-stepped-form.ts
import { CreatePropertyContext } from "@/app/(platform)/agencies/_components/step-form";
import { useContext } from "react";

export const useCreatePropertyForm = () => {
  const context = useContext(CreatePropertyContext);
  if (!context) {
    throw new Error(
      "useCreatePropertyForm must be used within CreatePropertyForm.Provider",
    );
  }
  return context;
}
