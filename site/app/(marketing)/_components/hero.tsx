"use client";

import { motion } from "framer-motion";
import { DotPattern } from "@/components/magicui/dot-pattern";
import BlurIn from "@/components/magicui/blur-in";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export function Hero() {
  return (
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
  );
}
