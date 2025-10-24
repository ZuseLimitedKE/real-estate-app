import { useCreatePropertyForm } from "@/hooks/use-stepped-form";
import { Trash } from "lucide-react";

interface CreatedApartmentUnitsProps {
    remove: (index: number) => void,
    index: number,
    name?: string,
    template_name?: string,
    floor?: number
}

export default function CreatedApartmentUnits(props: CreatedApartmentUnitsProps) {
    const {saveFormState, currentStep} = useCreatePropertyForm();
    return (
        <section className="rounded-md p-2 bg-slate-100 space-y-1 min-w-[200px] overflow-y-auto max-h-[450px] relative">
            <button
                type="button"
                className="absolute right-[5px] top-[5px] p-1 hover:bg-red-50 rounded transition-colors"
                aria-label="Remove unit"
                onClick={() => {
                    props.remove(props.index);
                    saveFormState(currentStep);
                }}
            >
                <Trash className="w-6 h-6 text-red-500" aria-hidden="true"/>
            </button>
            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit Name: </p>
                <p>{props.name ?? "N/A"}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit Template Name: </p>
                <p>{props.template_name ?? "N/A"}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <p className="font-bold">Unit Floor: </p>
                <p>{props.floor ?? "N/A"}</p>
            </div>
        </section>
    );
}