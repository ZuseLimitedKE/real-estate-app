// prevbutton.tsx
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { Button } from "@/components/ui/button";

const PrevButton = () => {
  const { isFirstStep, previousStep } = useMultiStepForm();

  return (
    <Button
      variant="outline"
      type="button"
      className="mt-5 w-full py-6"
      onClick={previousStep}
      disabled={isFirstStep}
    >
      Previous
    </Button>
  );
};
export { PrevButton };
