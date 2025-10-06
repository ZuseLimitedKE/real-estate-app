"use client";

import { motion } from "framer-motion";
import Image from "next/image";
const navLinks = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#properties", label: "Properties" },
];

export default function MarketingNavbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/20 shadow-sm "
    >
      <div className=" mx-auto px-4 md:px-12">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-end gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              className="w-8 h-8"
              src="/logo.png"
              alt="logo"
              width={100}
              height={100}
            />
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              Atria
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link, _) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-muted-foreground hover:text-primary transition-all duration-300 font-medium rounded-lg  group"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-8 group-hover:left-1/2 group-hover:-translate-x-1/2"></span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
