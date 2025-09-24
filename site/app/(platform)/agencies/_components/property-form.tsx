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
  title: "Step 1.5: Appartment Details",
  component: <ApartmentDetailsStep />,
  icon: HousePlus,
  position: 1.5,
  validationSchema: stepSchemas.apartmentsStep,
  fields: ["apartmentDetails"]
}

export const remainingSteps: FormStep[] = [
{
    title: "Step 2: Address Details",
    component: <Step2 />,
    icon: MapIcon,
    position: 2,
    validationSchema: stepSchemas.step2,
    fields: ["location"],
  },
  {
    title: "Step 3: Tenant Information",
    component: <Step3 />,
    icon: User,
    position: 3,
    validationSchema: stepSchemas.step3,
    fields: ["tenant"],
  },
  {
    title: "Step 4:  Financial Information",
    component: <Step4 />,
    icon: Wallet,
    position: 4,
    validationSchema: stepSchemas.step4,
    fields: ["proposedRentPerMonth", "serviceFeePercent", "property_value"],
  },
  {
    title: "Step 5: Property Images",
    component: <Step5 />,
    icon: Camera,
    position: 5,
    validationSchema: stepSchemas.step5,
    fields: ["images"],
  },
  {
    title: "Step 6: Legal Documents",
    component: <Step6 />,
    icon: FileIcon,
    position: 6,
    validationSchema: stepSchemas.step6,
    fields: ["documents"],
  },
]

export function AddPropertyForm({ userId }: { userId: string }) {
  return <MultiStepForm userId={userId} />;
}
