"use client";
import { motion } from "framer-motion";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { cn } from "@/lib/utils";
import { Coins, Shield, Users, TrendingUp, Lock } from "lucide-react";
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

export function About() {
  return (
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
            We're breaking down barriers to property ownership. With fractional
            ownership and blockchain trust, anyone can now access premium real
            estate across Kenya, earn rental income, and build wealth—without
            needing millions or managing tenants.
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
  );
}
