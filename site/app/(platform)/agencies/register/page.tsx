import { requireAuth } from "@/auth/utils"
import MultiStepForm from "../_components/step-form";

export default async function RegisterProperty() {
    const user = await requireAuth();
    return (
        <main className="min-h-screen">
            <MultiStepForm userID={user.userId} />
        </main>
    )
}