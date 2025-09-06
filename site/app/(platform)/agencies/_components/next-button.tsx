import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMultiStepForm } from "@/hooks/use-stepped-form";

// nextbutton.tsx
const NextButton = ({
  onClick,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { isLastStep, isSubmitting } = useMultiStepForm();
  return (
    <Button
      className="text-white bg-primary hover:bg-primary/90 transition-colors w-full py-6"
      type={isLastStep ? "submit" : "button"}
      onClick={onClick}
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
};
export { NextButton };
