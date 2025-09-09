"use client";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const propertyImages = [
  {
    id: 1,
    title: "Modern Apartment Complex - Westlands",
    location: "Westlands, Nairobi",
    price: "From KES 50,000",
    image: "/modern-apartment-building-nairobi-westlands.jpg",
  },
  {
    id: 2,
    title: "Luxury Residential Tower - Kilimani",
    location: "Kilimani, Nairobi",
    price: "From KES 75,000",
    image: "/luxury-residential-tower-nairobi-kilimani.jpg",
  },
  {
    id: 3,
    title: "Executive Apartments - Karen",
    location: "Karen, Nairobi",
    price: "From KES 100,000",
    image: "/executive-apartments-karen-nairobi.jpg",
  },
  {
    id: 4,
    title: "Waterfront Development - Mombasa",
    location: "Nyali, Mombasa",
    price: "From KES 60,000",
    image: "/waterfront-apartment-development-mombasa-nyali.jpg",
  },
  {
    id: 5,
    title: "Garden City Residences - Thika Road",
    location: "Thika Road, Nairobi",
    price: "From KES 40,000",
    image: "/garden-city-residences-thika-road-nairobi.jpg",
  },
];

export function Properties() {
  return (
    <section id="properties" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Investment Opportunities
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Verified apartments and developments across Kenya available soon for
            fractional investment. Each property is thoroughly vetted by trusted
            agencies.
          </p>
        </motion.div>

        {/* Property Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {propertyImages.map((property) => (
                <CarouselItem
                  key={property.id}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl group bg-background/80 backdrop-blur-sm">
                    <div className="relative overflow-hidden">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        Coming Soon
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {property.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-primary" />
                        {property.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {property.price}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 bg-transparent"
                        >
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-12 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5" />
            <CarouselNext className="hidden md:flex -right-12 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/5" />
          </Carousel>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Be the first to invest when these properties launch. Join our
              waitlist today.
            </p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              Join Waitlist
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
