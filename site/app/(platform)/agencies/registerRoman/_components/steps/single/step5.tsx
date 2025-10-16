import type { CreatePropertyType } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { useCreatePropertyForm } from "@/hooks/use-stepped-form";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export const Step5 = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreatePropertyType>();
  const { saveFormState, currentStep } = useCreatePropertyForm();

  const images = watch("single_property_details.images") || [];

  return (
    <>
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
            const currentImages = watch("single_property_details.images") || [];
            const updatedImages = Array.from(
              new Set([...currentImages, ...newImageUrls]),
            );
            setValue("single_property_details.images", updatedImages, {
              shouldValidate: true,
            });
            setTimeout(() => {
              saveFormState(currentStep);
            }, 200);
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
        {errors.single_property_details?.images && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.single_property_details?.images.message}</p>
          </div>
        )}
      </div>

      {/* Uploaded Images Display */}
      {images.length > 0 && <div>{images.length} uploaded image(s)</div>}
    </>
  );
};
