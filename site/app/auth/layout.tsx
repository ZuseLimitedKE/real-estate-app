import AuthNavbar from "@/components/auth-navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative">
      <AuthNavbar />
      {children}
    </div>
  );
}
