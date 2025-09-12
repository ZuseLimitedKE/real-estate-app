import VerifyEmail from "../_components/VerifyEmail";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
const Fallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="large" className="text-primary" />
    </div>
  );
};
export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<Fallback />}>
      <VerifyEmail searchParams={searchParams} />
    </Suspense>
  );
}
