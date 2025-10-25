"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, TrendingUp, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  image: string | StaticImageData;
  title: string;
  location: string;
  value: string;
  yield: string;
  investors: number;
  availableShares: number;
  minInvestment: string;
  verified?: boolean;
  listingDate: Date;
  pricePerToken: string;
  projectedReturn: string;
  onAddToWishlist?: (propertyId: string) => void;
  isInWishlist?: boolean;
  propertyType?: "single" | "apartment";
  amenities?: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    parking_spaces?: number | null;
  };
  unitTemplates?: Array<{
    id: string;
    name: string;
    image: string;
    bedrooms?: number;
    bathrooms?: number;
    proposedRentPerMonth: number;
  }>;
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  value,
  yield: propertyYield,
  investors,
  availableShares,
  minInvestment,
  verified = false,
  listingDate,
  pricePerToken,
  projectedReturn,
  onAddToWishlist,
  isInWishlist = false,
  propertyType = "single",
  amenities,
  unitTemplates,
}: PropertyCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(id);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <Card className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/60 cursor-pointer bg-gradient-to-br from-white py-0 to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl h-full flex flex-col">
      <CardHeader className="relative p-0 ">
        <div className="relative overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            width={400}
            height={200}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Listing date badge */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="secondary"
              className="bg-accent-foreground/90 text-white border-0 backdrop-blur-sm text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              Listed {getTimeAgo(listingDate)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Property title and location */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mt-1">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          {/* Key metrics - condensed */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Value
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {value}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Price/Token
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {pricePerToken}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Return
              </p>
              <p className="font-bold text-green-600 text-sm">
                {projectedReturn}
              </p>
            </div>
          </div>

          {propertyType === "single" && amenities && (
            <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs">
                {amenities.bedrooms !== null &&
                  amenities.bedrooms !== undefined && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        BEDROOMS
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {amenities.bedrooms}
                      </p>
                    </div>
                  )}
                {amenities.bathrooms !== null &&
                  amenities.bathrooms !== undefined && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        BATHROOMS
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {amenities.bathrooms}
                      </p>
                    </div>
                  )}
                {amenities.parking_spaces !== null &&
                  amenities.parking_spaces !== undefined && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        PARKING
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {amenities.parking_spaces}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {propertyType === "apartment" &&
            unitTemplates &&
            unitTemplates.length > 0 && (
              <div onClick={(e) => e.stopPropagation()} className="w-full">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="units" className="border-0">
                    <AccordionTrigger className="py-2 px-0 hover:no-underline text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-2">
                        Unit Types ({unitTemplates.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <div className="space-y-2">
                        {unitTemplates.map((unit) => (
                          <div
                            key={unit.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <Image
                              src={unit.image || "/placeholder.svg"}
                              alt={unit.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {unit.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                KSh{" "}
                                {new Intl.NumberFormat().format(
                                  unit.proposedRentPerMonth,
                                )}
                                /mo
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
        </div>
      </CardContent>

      <CardFooter className="px-5 pt-0 pb-4">
        <Link href={`/investors/${id}`} className="w-full">
          <Button className="w-full bg-accent-foreground text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn rounded-lg h-10">
            <DollarSign className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Invest Now
            <TrendingUp className="w-4 h-4 ml-2 opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
