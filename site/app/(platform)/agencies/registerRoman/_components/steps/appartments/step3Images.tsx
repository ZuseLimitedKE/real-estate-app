import { Label } from "@/components/ui/label";
import { useCreatePropertyForm } from "@/hooks/use-stepped-form";
import { CreatePropertyType } from "@/types/property";
import { UploadDropzone } from "@/utils/uploadthing";
import { AlertCircle } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";

export default function ApartmentUnitTemplateImages({ unitTemplatesLength }: {unitTemplatesLength: number}) {
    const {
        watch,
        setValue,
        formState: { errors }
    } = useFormContext<CreatePropertyType>();
    // const { saveFormState, currentStep } = useCreatePropertyForm();

    const images = watch(`apartment_property_details.unit_templates.${unitTemplatesLength}.images`)


    return (
        <div>
            <Label>Image(s) of the unit</Label>
            {/* Upload Section */}
            <div className="space-y-4">
                <UploadDropzone
                    endpoint="imageUploader"
                    appearance={{
                        container:
                            "w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors duration-200",
                        uploadIcon: "text-gray-400",
                        label: "text-gray-600 font-medium hover:text-primary",
                        allowedContent: "text-gray-500 text-sm",
                        button:
                            "bg-primary hover:bg-primary/90 ut-ready:bg-primary ut-uploading:bg-primary/50 ut-readying:bg-primary/70 focus:outline-primary transition-all duration-200",
                    }}
                    content={{
                        uploadIcon: ({ ready, isUploading }) => {
                            if (isUploading) return "📤";
                            if (ready) return "📸";
                            return "⏳";
                        },
                        label: ({ ready, isUploading }) => {
                            if (isUploading) return "Uploading...";
                            if (ready) return "Choose images or drag and drop";
                            return "Getting ready...";
                        },
                        allowedContent: ({ ready, fileTypes, isUploading }) => {
                            if (isUploading) return "Please wait...";
                            if (!ready) return "Preparing...";
                            return `Allowed: ${fileTypes.join(", ")}`;
                        },
                    }}
                    className="ut-button:bg-primary ut-button:ut-readying:bg-primary/70 ut-button:ut-uploading:bg-primary/50 ut-uploading:ut-button:bg-primary/50 ut-button:hover:bg-primary/90"
                    onClientUploadComplete={(res) => {
                        const newImageUrls =
                            res?.map((file) => file.ufsUrl).filter(Boolean) || [];
                        const currentImages = watch(`apartment_property_details.unit_templates.${unitTemplatesLength}.images`) || [];
                        const updatedImages = Array.from(
                            new Set([...currentImages, ...newImageUrls]),
                        ) as string[];
                        setValue(`apartment_property_details.unit_templates.${unitTemplatesLength}.images`, updatedImages, {
                            shouldValidate: true,
                        });
                        // setTimeout(() => {
                        //     saveFormState(currentStep);
                        // }, 200);
                        toast.success(
                            `${newImageUrls.length > 1 ? "Images" : "Image"} uploaded successfully`,
                        );
                    }}
                    onUploadError={(error: Error) => {
                        toast.error(`Upload Failed! ${error.message}`);
                    }}
                    onUploadBegin={(fileName) => {
                        toast.info(`Uploading ${fileName}...`);
                    }}
                />

                {/* Image-specific error */}
                {errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.images && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.apartment_property_details?.unit_templates?.[unitTemplatesLength]?.images?.message}</p>
                    </div>
                )}
            </div>

            {/* Uploaded Images Display */}
            {images && images.length > 0 && <div>{images.length} uploaded image(s)</div>}
        </div>
    );
}