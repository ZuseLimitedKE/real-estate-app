"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Apartment edit page error:", error);
  }, [error]);

  const getErrorMessage = () => {
    if (error.message.includes("Invalid property id")) {
      return "Invalid property ID provided.";
    }
    if (error.message.includes("Property does not exist")) {
      return "Property not found or you don't have permission to edit it.";
    }
    if (error.message.includes("NOT_FOUND_PROPERTY")) {
      return "This property could not be found.";
    }
    return "Failed to load apartment details. Please try again.";
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card className="border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800">
            Unable to Load Apartment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 text-center">
            <p>Error ID: {error.digest}</p>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
