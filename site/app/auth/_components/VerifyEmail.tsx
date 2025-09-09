"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle, Loader2, MailX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/server-actions/auth/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await verifyEmail(token);

        if (result?.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {status === "pending" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Verifying your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please hold on while we confirm your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Email Verified 🎉
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been successfully verified. You can now log in to your
              account.
            </p>
            <div className="mt-6">
              <Link href="/auth/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <MailX className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We couldn’t verify your email. The link may have expired or is
              invalid.
            </p>
            <div className="mt-6">
              <Link href="/auth/resend-verification">
                <Button className="w-full" variant="outline">
                  Resend Verification Email
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
