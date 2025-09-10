"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const AgencyVerificationPending = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Clock className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          Registration Under Review
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Thank you for registering your agency on our real estate platform. Our
          team is currently reviewing your information. You will be notified via
          email once the verification process is complete.
        </p>
        <div className="mt-6">
          <Button asChild className="w-full">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgencyVerificationPending;
