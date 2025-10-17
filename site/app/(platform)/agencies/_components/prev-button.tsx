import { Button } from "@/components/ui/button";
import { useCreatePropertyForm } from "@/hooks/use-stepped-form";

export default function PreviousButton() {
    const { isFirstStep, previousStep, isSubmitting } = useCreatePropertyForm();

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
}