import { AppNavbar } from "@/components/app-navbar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full relative min-h-screen">
      <AppNavbar />
      <div className="pt-6 lg:pt-6  md:px-4 px-4">{children}</div>
    </div>
  );
}
