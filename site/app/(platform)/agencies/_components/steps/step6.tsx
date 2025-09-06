import { AddPropertyFormData } from "@/types/property";
import { useFormContext } from "react-hook-form";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { NextButton } from "../next-button";
import { useMultiStepForm } from "@/hooks/use-stepped-form";
import { AlertCircle } from "lucide-react";

export const Step6 = () => {
  const {
    getValues,
    setValue,
    formState: { errors, isValid },
  } = useFormContext<AddPropertyFormData>();
  const { saveFormState, currentStepIndex } = useMultiStepForm();

  const documents = getValues("documents") || [];
  const handleStepSubmit = () => {
    return;
  };

  // Get all form errors for debugging
  const allErrors = Object.keys(errors).length > 0 ? errors : null;

  return (
    <>
      {/* Upload Section */}
      <div className="space-y-4">
        <UploadDropzone
          endpoint="documentUploader"
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
            const newDocuments =
              res
                ?.map((file) => ({
                  url: file.ufsUrl,
                  name: file.name,
                }))
                .filter(Boolean) || [];
            const currentDocuments = getValues("documents") || [];
            const byUrl = new Map<string, { url: string; name: string }>();
            [...(currentDocuments || []), ...newDocuments].forEach((d) => {
              if (d?.url) byUrl.set(d.url, d);
            });
            const updatedDocuments = Array.from(byUrl.values());
            setValue("documents", updatedDocuments, {
              shouldValidate: true,
            });
            setTimeout(() => {
              saveFormState(currentStepIndex);
            }, 200);
            toast.success(
              `${newDocuments.length > 1 ? "Documents" : "Document"} uploaded successfully`,
            );
          }}
          onUploadError={(error: Error) => {
            toast.error(`Upload Failed! ${error.message}`);
          }}
          onUploadBegin={(fileName) => {
            toast.info(`Uploading ${fileName}...`);
          }}
        />

        {/* Document-specific error */}
        {errors.documents && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.documents.message}</p>
          </div>
        )}
      </div>

      {/* Uploaded Documents Display */}
      {documents.length > 0 && (
        <div>{documents.length} uploaded document(s)</div>
      )}

      {/* Form Validation Status */}
      <div className="space-y-3">
        {/* Debug: Show all form errors */}
        {allErrors && !isValid && (
          <details className="border border-red-200 rounded-lg p-3 bg-red-50">
            <summary className="text-sm font-medium text-red-700 cursor-pointer hover:text-red-800">
              View Form Errors ({Object.keys(allErrors).length})
            </summary>
            <div className="mt-3 space-y-2">
              {Object.entries(allErrors).map(([field, error]) => (
                <div key={field} className="text-xs">
                  <span className="font-medium text-red-600">{field}:</span>{" "}
                  <span className="text-red-700">
                    {typeof error === "object" &&
                      error !== null &&
                      "message" in error
                      ? (error as any).message
                      : JSON.stringify(error)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <NextButton onClick={handleStepSubmit} />
    </>
  );
};
