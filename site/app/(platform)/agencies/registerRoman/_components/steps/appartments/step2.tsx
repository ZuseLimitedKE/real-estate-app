import { useCreatePropertyForm } from "@/hooks/use-stepped-form";
import { CreatePropertyType } from "@/types/property";
import { UploadDropzone } from "@/utils/uploadthing";
import { AlertCircle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

export default function ApartmentDocumentsForm() {
    const {
        getValues,
        setValue,
        formState: { errors, isValid }
    } = useFormContext<CreatePropertyType>();
    const { saveFormState, currentStep } = useCreatePropertyForm();

    const documents = getValues("apartment_property_details.documents") || [];
    // Get all form errors for debugging
    const allErrors = Object.keys(errors).length > 0 ? errors : null;

    return (
        <section>
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
                                    type: file.type,
                                    size: file.size < 1024
                                        ? `${file.size} B`
                                        : file.size < 1_048_576
                                            ? `${(file.size / 1024).toFixed(1)} KB`
                                            : file.size < 1_073_741_824
                                                ? `${(file.size / 1_048_576).toFixed(1)} MB`
                                                : `${(file.size / 1_073_741_824).toFixed(1)} GB`
                                }))
                                .filter(Boolean) || [];

                        const currentDocuments = getValues("apartment_property_details.documents") || [];
                        const byUrl = new Map<string, { url: string; name: string, type: string, size: string }>();
                        [...(currentDocuments || []), ...newDocuments].forEach((d) => {
                            if (d?.url) byUrl.set(d.url, d);
                        });
                        const updatedDocuments = Array.from(byUrl.values());
                        setValue("apartment_property_details.documents", updatedDocuments, {
                            shouldValidate: true,
                        });
                        setTimeout(() => {
                            saveFormState(currentStep);
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
                {errors.apartment_property_details?.documents && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.apartment_property_details?.documents.message}</p>
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
        </section>
    );
}