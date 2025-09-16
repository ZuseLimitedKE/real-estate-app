import { requireAuth } from "@/auth/utils";
import { AddPropertyForm } from "../_components/property-form";
export default async function RegisterPropertyPage() {
  const user = await requireAuth();
  return (
    <div className="min-h-screen">
      <AddPropertyForm userId={user.userId} />
    </div>
  );
}
