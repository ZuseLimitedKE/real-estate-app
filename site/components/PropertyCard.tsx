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
import { MapPin, TrendingUp, Clock, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { useState, useCallback } from "react";

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
  gallery?: string[]; // gallery prop for multiple images
}

const PropertyCard = ({
  id,
  image,
  title,
  location,
  value,
  verified = false,
  listingDate,
  pricePerToken,
  projectedReturn,
  propertyType = "single",
  amenities,
  unitTemplates,
  gallery = [],
}: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use gallery if available, otherwise use main image only
  const allImages = gallery.length > 0 ? gallery : [image];
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

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  const goToImage = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  }, []);

  // Show carousel controls only if we have multiple images
  const showCarouselControls = allImages.length > 1;

  return (
    <Card className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/60 cursor-pointer bg-gradient-to-br from-white py-0 to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl h-full flex flex-col">
      <CardHeader className="relative p-0">
        <div className="relative overflow-hidden">
          {/* Image Container */}
          <div className="relative w-full h-60 overflow-hidden">
            <Image
              src={allImages[currentImageIndex] || "/placeholder.svg"}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              width={400}
              height={300}
              className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />

            {/* Navigation Arrows - Only show if multiple images */}
            {showCarouselControls && (
              <>
                {/* Left Arrow - Always visible for better UX */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Right Arrow - Always visible for better UX */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image Indicators/Dots */}
            {showCarouselControls && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToImage(index, e)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter */}
            {/* {showCarouselControls && (
              <div className="absolute top-3 right-3 bg-black/80 text-white text-[12px] px-2 py-1 rounded-full backdrop-blur-sm z-10">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )} */}

            {/* Listing date badge */}
            <div className="absolute bottom-3 left-3 z-10">
              <Badge
                variant="secondary"
                className="bg-accent-foreground/90 text-white border-0 backdrop-blur-sm text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                Listed {getTimeAgo(listingDate)}
              </Badge>
            </div>

            {/* Verified Badge */}
            {verified && (
              <div className="absolute top-3 left-3 z-10">
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground border-0 backdrop-blur-sm text-xs"
                >
                  Verified
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 -mt-3 flex-1 flex flex-col">
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

      <CardFooter className="-mt-4 px-5 pt-0 pb-4">
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