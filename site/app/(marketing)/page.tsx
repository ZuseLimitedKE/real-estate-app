"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";
import BlurIn from "@/components/magicui/blur-in";
import MarketingNavbar from "@/components/marketing-navbar";
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
} from "lucide-react";
import Link from "next/link";

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

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#properties", label: "Properties" },
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
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Investing
              </Button>
            </Link>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 bg-transparent"
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
              We’re breaking down barriers to property ownership. With
              fractional ownership and blockchain trust, anyone can now access
              premium real estate across Kenya, earn rental income, and build
              wealth—without needing millions or managing tenants.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start Small
              </h3>
              <p className="text-muted-foreground">
                Begin your real estate journey with any budget. Own property
                fractions and scale your portfolio over time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Trust Built-In
              </h3>
              <p className="text-muted-foreground">
                Every investment, ownership record, and rent payment is secured
                on the blockchain for unmatched transparency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Professionally Managed
              </h3>
              <p className="text-muted-foreground">
                Partner agencies handle property upkeep and tenants. You enjoy
                hands-free passive income.
              </p>
            </motion.div>
          </div>
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

      {/* Properties Section Placeholder */}
      <section id="properties" className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Investment Opportunities
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Verified apartments and developments across Kenya available soon
              for fractional investment. Each property is thoroughly vetted by
              trusted agencies.
            </p>
            <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-primary/20 rounded-xl p-16">
              <Building2 className="w-16 h-16 text-primary/60 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Be the first to invest.Join our waitlist today.
              </p>
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
                <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <span className="text-xl font-bold text-foreground">
                    Real Estate App
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Fractional Property Investment in Kenya
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
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
              © 2025 Real Estate App. All rights reserved.
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
