"use client";
import { stepSchemas } from "@/types/property";
import { MultiStepForm } from "./step-form";
import { House, MapIcon, User, Wallet, Camera, FileIcon, HousePlus } from "lucide-react";
import { Step1 } from "./steps/step1";
import { Step2 } from "./steps/step2";
import { Step3 } from "./steps/step3";
import { Step4 } from "./steps/step4";
import { Step5 } from "./steps/step5";
import { Step6 } from "./steps/step6";
import { FormStep } from "@/types/form";
import { ApartmentDetailsStep } from "./steps/apartmentDetailsStep";

export const baseSteps: FormStep[] = [
  {
    title: "Step 1: Property Information",
    component: <Step1 />,
    icon: House,
    position: 1,
    validationSchema: stepSchemas.step1,
    fields: ["name", "type", "description", "gross_property_size", "amenities"],
  },
];

export const apartmentDetailsStep: FormStep = {
  title: "Apartment Details",
  component: <ApartmentDetailsStep />,
  icon: HousePlus,
  position: 2,
  validationSchema: stepSchemas.apartmentsStep,
  fields: ["apartmentDetails"]
}

export const remainingSteps: Omit<FormStep, 'position'>[] = [
{
    title: "Address Details",
    component: <Step2 />,
    icon: MapIcon,
    validationSchema: stepSchemas.step2,
    fields: ["location"],
  },
  {
    title: "Tenant Information",
    component: <Step3 />,
    icon: User,
    validationSchema: stepSchemas.step3,
    fields: ["tenant"],
  },
  {
    title: "Financial Information",
    component: <Step4 />,
    icon: Wallet,
    validationSchema: stepSchemas.step4,
    fields: ["proposedRentPerMonth", "serviceFeePercent", "property_value"],
  },
  {
    title: "Property Images",
    component: <Step5 />,
    icon: Camera,
    validationSchema: stepSchemas.step5,
    fields: ["images"],
  },
  {
    title: "Legal Documents",
    component: <Step6 />,
    icon: FileIcon,
    validationSchema: stepSchemas.step6,
    fields: ["documents"],
  },
]

export function AddPropertyForm({ userId }: { userId: string }) {
  return <MultiStepForm userId={userId} />;
}
