"use client";
import { Coins, Shield, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { CardContent, Card } from "@/components/ui/card";

export function Features() {
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

  return (
    <section id="services" className="py-24 px-4 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
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
            liquidity on our secondary market, all with blockchain-backed
            transparency.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-border/40 hover:border-border transition-all duration-300 hover:shadow-lg group bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    {/* Icon container */}
                    <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    {/* Text content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
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
  );
}
