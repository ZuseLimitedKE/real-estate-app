import { requireAuth, UserRole } from "@/auth/utils";
import { AppNavbar } from "@/components/app-navbar";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="w-full relative min-h-screen">
      <AppNavbar role={user.role.toLowerCase() as UserRole} />
      <div className="pt-6 lg:pt-6  md:px-4 px-4">{children}</div>
    </div>
  );
}
