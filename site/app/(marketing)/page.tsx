"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import BlurIn from "@/components/magicui/blur-in";
import MarketingNavbar from "@/components/marketing-navbar";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Users,
  Building2,
  Mail,
  Phone,
  MapIcon,
  Coins,
  Shield,
  BarChart3,
  Zap,
  TrendingUp,
  Lock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const MotionDiv = motion.div;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const features = [
  {
    icon: Coins,
    title: "Own Property Without Millions",
    description:
      "Buy fractions of premium apartments and developments across Kenya. Start small, diversify, and grow your real estate portfolio with ease.",
  },
  {
    icon: Shield,
    title: "Blockchain-Powered Trust",
    description:
      "Every investment, rent payment, and ownership record is secured on-chain. Transparency and security you can rely on.",
  },
  {
    icon: BarChart3,
    title: "Earn Passive Rental Income",
    description:
      "Sit back while vetted partner agencies handle tenants and property management. You receive your share of rent directly, every month.",
  },
  {
    icon: Zap,
    title: "Liquidity When You Need It",
    description:
      "Trade your property shares on our secondary marketplace. Buy more, sell when you need cash, and track performance on-chain.",
  },
];
const bentoFeatures = [
  {
    Icon: ({ className }: { className?: string }) => (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-sm" />
        <div className="relative bg-gradient-to-br from-background to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg">
          <Coins className="w-6 h-6 text-primary" />
        </div>
      </div>
    ),
    name: "Start Small",
    description:
      "Begin your real estate journey with any budget. Own property fractions and scale your portfolio over time.",
    href: "/investors",
    cta: "Learn more",
    background: <div className="absolute inset-0" />,
    className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: ({ className }: { className?: string }) => (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-sm" />
        <div className="relative bg-gradient-to-br from-background to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg">
          <Shield className="w-6 h-6 text-primary" />
        </div>
      </div>
    ),
    name: "Trust Built-In",
    description:
      "Every investment, ownership record, and rent payment is secured on the blockchain for unmatched transparency.",
    href: "/investors",
    cta: "Learn more",
    background: <div className="absolute inset-0" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: ({ className }: { className?: string }) => (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-sm" />
        <div className="relative bg-gradient-to-br from-background to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg">
          <Users className="w-6 h-6 text-primary" />
        </div>
      </div>
    ),
    name: "Professionally Managed",
    description:
      "Partner agencies handle property upkeep and tenants. You enjoy hands-free passive income.",
    href: "/investors",
    cta: "Learn more",
    background: <div className="absolute inset-0" />,
    className: "lg:row-start-3 lg:row-end-4 lg:col-start-1 lg:col-end-2",
  },
  {
    Icon: ({ className }: { className?: string }) => (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-sm" />
        <div className="relative bg-gradient-to-br from-background to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
      </div>
    ),
    name: "Portfolio Growth",
    description:
      "Track your investments and returns in real-time with detailed performance analytics.",
    href: "/investors",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-primary/5" />
    ),
    className: "lg:row-start-1 lg:row-end-2 lg:col-start-3 lg:col-end-4",
  },
  {
    Icon: ({ className }: { className?: string }) => (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-sm" />
        <div className="relative bg-gradient-to-br from-background to-primary/10 rounded-full p-3 border border-primary/20 shadow-lg">
          <Lock className="w-6 h-6 text-primary" />
        </div>
      </div>
    ),
    name: "Verified Properties",
    description:
      "All properties are thoroughly vetted and verified by trusted partner agencies before listing.",
    href: "/investors",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-muted/10" />
    ),
    className: "lg:row-start-2 lg:row-end-4 lg:col-start-3 lg:col-end-4",
  },
];
const navLinks = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#properties", label: "Properties" },
];

const propertyImages = [
  {
    id: 1,
    title: "Modern Apartment Complex - Westlands",
    location: "Westlands, Nairobi",
    price: "From KES 50,000",
    image: "/modern-apartment-building-nairobi-westlands.jpg",
  },
  {
    id: 2,
    title: "Luxury Residential Tower - Kilimani",
    location: "Kilimani, Nairobi",
    price: "From KES 75,000",
    image: "/luxury-residential-tower-nairobi-kilimani.jpg",
  },
  {
    id: 3,
    title: "Executive Apartments - Karen",
    location: "Karen, Nairobi",
    price: "From KES 100,000",
    image: "/executive-apartments-karen-nairobi.jpg",
  },
  {
    id: 4,
    title: "Waterfront Development - Mombasa",
    location: "Nyali, Mombasa",
    price: "From KES 60,000",
    image: "/waterfront-apartment-development-mombasa-nyali.jpg",
  },
  {
    id: 5,
    title: "Garden City Residences - Thika Road",
    location: "Thika Road, Nairobi",
    price: "From KES 40,000",
    image: "/garden-city-residences-thika-road-nairobi.jpg",
  },
];
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <MarketingNavbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-accent/5 to-primary/5"
      >
        <DotPattern
          className={cn(
            "text-primary/20",
            "[mask-image:radial-gradient(60vw_circle_at_center,white,transparent)]",
          )}
        />
        <MotionDiv
          className="relative z-10 flex flex-col items-center justify-center min-h-screen space-y-8 px-4 pt-28 "
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center">
            <BlurIn
              word="Own a Piece of Kenyan Real Estate"
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4"
              duration={1}
            />
            <motion.p
              className="text-xl md:text-2xl text-black/60 max-w-3xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Invest in fractions of high-value properties across Kenya. Earn
              monthly rental income, trade your shares anytime.
            </motion.p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link href="/investors">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Start Investing
              </Button>
            </Link>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/20 font-semibold hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 bg-transparent"
            >
              <Link href="#about">Learn More</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-16 flex justify-center"
          >
            <motion.a
              href="#about"
              aria-label="Scroll to About section"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.a>
          </motion.div>
        </MotionDiv>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Real Estate Investment for Every Kenyan
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              We're breaking down barriers to property ownership. With
              fractional ownership and blockchain trust, anyone can now access
              premium real estate across Kenya, earn rental income, and build
              wealth—without needing millions or managing tenants.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <BentoGrid className="lg:grid-rows-3 md:grid-cols-2 lg:grid-cols-3">
              {bentoFeatures.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
              ))}
            </BentoGrid>
          </motion.div>
        </div>
      </section>
      {/* Features/Services Section */}
      <section id="services" className="py-24 px-4 bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invest fractionally in properties, earn monthly rent, and enjoy
              liquidity on our secondary market , all with blockchain-backed
              transparency.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 border border-primary/20">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Properties Section with Slideshow */}
      <section id="properties" className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Investment Opportunities
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Verified apartments and developments across Kenya available soon
              for fractional investment. Each property is thoroughly vetted by
              trusted agencies.
            </p>
          </motion.div>

          {/* Property Slideshow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {propertyImages.map((property) => (
                  <CarouselItem
                    key={property.id}
                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group bg-background/80 backdrop-blur-sm">
                      <div className="relative overflow-hidden">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Coming Soon
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {property.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2">
                          <MapIcon className="w-4 h-4 text-primary" />
                          {property.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {property.price}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 bg-transparent"
                          >
                            Learn More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5" />
              <CarouselNext className="hidden md:flex -right-12 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5" />
            </Carousel>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                Be the first to invest when these properties launch. Join our
                waitlist today.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Join Waitlist
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-br from-background via-accent/5 to-primary/5 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  className="w-7 h-7 text-primary"
                  width={100}
                  height={100}
                  src="/logo.png"
                  alt="logo"
                />
                <div>
                  <span className="text-xl font-bold text-foreground">
                    Atria
                  </span>
                  <p className="text-xs  text-muted-foreground">
                    Fractional Property Investment in Kenya
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
                Making real estate investment accessible to every Kenyan through
                fractional ownership.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Get in Touch
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">roman.njoroge@njuguna.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm">+254 702 735922</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm">Nairobi, Kenya</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Atria. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a
                href="#"
                className="hover:text-primary transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors duration-200"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
