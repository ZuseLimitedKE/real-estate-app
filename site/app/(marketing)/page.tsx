import MarketingNavbar from "@/components/marketing-navbar";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { About } from "./_components/about";
import { Features } from "./_components/features";
import { Properties } from "./_components/properties";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <MarketingNavbar />

      {/* Hero Section */}
      <Hero />

      {/* About Section */}
      <About />
      {/* Features/Services Section */}
      <Features />
      {/* Properties Section with Slideshow */}
      <Properties />
      {/* Footer Section */}
      <Footer />
    </main>
  );
}
