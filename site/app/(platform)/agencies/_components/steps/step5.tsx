import { AddPropertyFormData } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { NextButton } from "../next-button";
export const Step5 = () => {
  const {
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<AddPropertyFormData>();

  const { nextStep } = useMultiStepForm();

  const handleStepSubmit = () => {
    nextStep();
  };
  return (
    <>
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
            if (ready) return "📁";
            return "⏳";
          },
          label: ({ ready, isUploading }) => {
            if (isUploading) return "Uploading...";
            if (ready) return "Choose files or drag and drop";
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

          const currentImages = getValues("images");
          const updatedImages = Array.from(
            new Set([...currentImages, ...newImageUrls]),
          );
          setValue("images", updatedImages, {
            shouldValidate: true,
          });
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

      {errors.images && (
        <p className="text-sm text-red-500 mt-1">{errors.images.message}</p>
      )}

      <NextButton onClick={handleStepSubmit} />
    </>
  );
};
