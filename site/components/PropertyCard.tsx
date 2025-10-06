import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, Verified, Heart, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
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
  listingDate: string;
  pricePerToken: string;
  projectedReturn: string;
  onAddToWishlist?: (propertyId: string) => void;
  isInWishlist?: boolean;
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
}: PropertyCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(id);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
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
    <Link href={`/investors/${id}`}>
      <Card className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border/60 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl">
      <CardHeader className="relative">
        <div className="relative overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={400}
            height={280}
            className="w-full h-50 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay badges */}
          {/* <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className="bg-green-500 text-white text-[16px] border-0 shadow-lg">
              {projectedReturn}
            </Badge>
          </div> */}

          {/* Listing date */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-accent-foreground/90 text-white border-0 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              Listed {getTimeAgo(listingDate)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5">
        <div className="space-y-4">
          {/* Property title and location */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                Total Value
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {value}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                Price/Token
              </p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {pricePerToken}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                Projected Return
              </p>
              <p className="font-bold text-green-600 text-sm">
                {projectedReturn}
              </p>
            </div>
          </div>

          {/* Investment info */}
          {/* <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Min. Investment</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {minInvestment}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">Rental Yield</p>
                <p className="font-semibold text-green-600 text-sm">
                  {propertyYield}
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </CardContent>

        <CardFooter className="px-5 pt-0">
        <Link href={`/investors/${id}`} className="w-full">
          <Button className="w-full bg-accent-foreground text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn rounded-2xl">
            <DollarSign className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Invest Now
            <TrendingUp className="w-4 h-4 ml-2 opacity-0 group-hover/btn:opacity-100 transition-all duration-300" />
          </Button>
        </Link>
      </CardFooter>

      </Card>
    </Link>
  );
};

export default PropertyCard;
