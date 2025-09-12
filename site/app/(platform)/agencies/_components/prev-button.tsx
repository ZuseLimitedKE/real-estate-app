// prevbutton.tsx
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { Button } from "@/components/ui/button";

const PrevButton = () => {
  const { isFirstStep, previousStep, isSubmitting } = useMultiStepForm();

  return (
    <Button
      variant="outline"
      type="button"
      className="md:w-1/2 w-full py-6 hover:text-primary hover:bg-primary/5"
      onClick={previousStep}
      disabled={isFirstStep || isSubmitting}
    >
      Previous
    </Button>
  );
};
export { PrevButton };
