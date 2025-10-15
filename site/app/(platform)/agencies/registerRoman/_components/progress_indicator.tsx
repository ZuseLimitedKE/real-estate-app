import { useCreatePropertyForm } from "@/hooks/use-stepped-form";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function CreatePropertyFormProgress() {
    const {currentStep, setCurrentStep, steps} = useCreatePropertyForm()

    const handleStepClick = (stepPosition: number) => {
        // Optional: Only allow going back to completed steps
        if (stepPosition - 1 <= currentStep) {
            setCurrentStep(stepPosition);
        }
    };

    return (
        <div className="hidden md:flex items-center w-full justify-center p-4 mb-10">
            <div className="w-full space-y-8">
                <div className="relative flex justify-between">
                    {/* Progress Line */}
                    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: "0%" }}
                            animate={{
                                width: `${(currentStep / (steps.length - 1)) * 100}%`,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                    </div>

                    {/* Steps */}
                    {steps.map((step) => {
                        const isCompleted = currentStep > step.num - 1;
                        const isCurrent = currentStep === step.num - 1;
                        const isClickable = step.num - 1 <= currentStep; // Only allow clicking completed or current steps

                        return (
                            <div key={step.num} className="relative z-10">
                                <motion.button
                                    type="button"
                                    onClick={() => handleStepClick(step.num)}
                                    disabled={!isClickable}
                                    className={`flex size-14 items-center justify-center rounded-full border-2 transition-colors ${isCompleted || isCurrent
                                        ? "border-primary bg-primary text-white"
                                        : isClickable
                                            ? "border-gray-300 bg-white text-gray-500 hover:border-primary/50"
                                            : "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
                                        }`}
                                    animate={{
                                        scale: isCurrent ? 1.1 : 1,
                                    }}
                                >
                                    {isCompleted ? (
                                        <Check className="h-6 w-6" />
                                    ) : (
                                        <step.icon className="h-6 w-6" />
                                    )}
                                </motion.button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}