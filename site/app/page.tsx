"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 lg:px-8">
      <div className="text-center max-w-2xl">
        <Building className="mx-auto h-16 w-16 text-blue-600" />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to RealEstate Platform
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your one-stop solution for buying, selling, and renting properties
          with ease.
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="px-8 py-3 text-lg rounded-2xl shadow-lg"
          >
            <Link href="/auth/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
