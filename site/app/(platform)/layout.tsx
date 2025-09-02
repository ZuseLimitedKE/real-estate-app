import { AppNavbar } from "@/components/app-navbar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full relative min-h-screen">
      <AppNavbar />
      <div className="pt-24 lg:pt-28  md:px-8 px-6">{children}</div>
    </div>
  );
}
