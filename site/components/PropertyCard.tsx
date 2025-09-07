import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, Verified } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  value: string;
  yield: string;
  investors: number;
  availableShares: number;
  minInvestment: string;
  verified?: boolean;
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
}: PropertyCardProps) => {
  return (
    <Link href={`/investors/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 cursor-pointer">
        <CardHeader className="p-0">
        <div className="relative">
          <Image 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary" className="bg-success text-success-foreground">
              {propertyYield} Yield
            </Badge>
            {verified && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                <Verified className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{title}</h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Property Value</p>
              <p className="font-semibold text-foreground">{value}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Available</p>
              <p className="font-semibold text-foreground">{availableShares}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Investors</p>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-primary" />
                <span className="font-semibold text-foreground">{investors}</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Min. Investment</p>
              <p className="font-semibold text-foreground">{minInvestment}</p>
            </div>
          </div>
        </div>
      </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button variant="default" className="w-full">
            Invest Now
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default PropertyCard;