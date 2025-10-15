import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreatePropertyForm } from "@/hooks/use-stepped-form";

export default function NextButton({
    ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { isLastStep, isSubmitting, nextStep } = useCreatePropertyForm();
    return (
        <Button
            className="text-white bg-primary hover:bg-primary/90 transition-colors w-full  py-6 md:w-1/2"
            type={"button"}
            onClick={nextStep}
            disabled={isSubmitting}
            {...rest}
        >
            {isLastStep ? (
                isSubmitting ? (
                    <Spinner size="small" />
                ) : (
                    "Submit"
                )
            ) : (
                "Continue"
            )}
        </Button>
    );
}