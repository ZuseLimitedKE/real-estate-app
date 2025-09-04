import z from "zod";
export const addPropertySchema = z.object({
  name: z.string().min(3, "Property title is required"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  images: z
    .array(z.url({ protocol: /^https$/ }))
    .min(1, "At least one image is required"),
  totalFractions: z
    .number()
    .int()
    .positive("Total fractions must be greater than 0"),
  agencyId: z.string().min(1, "Invalid agency ID"),
  proposedRentPerMonth: z
    .number()
    .positive("Proposed rent per month must be greater than 0"),
  serviceFeePercent: z.number().min(0).max(100),
  token_address: z.string().min(1, "Token address is required"),
  property_value: z.number().positive("Property value must be greater than 0"),
  gross_property_size: z
    .number()
    .positive("Property size must be greater than 0"),
  price: z.number().positive("Price must be greater than 0"),
  tenant: z
    .object({
      address: z.string().min(1, "Tenant address is required"),
      rentDate: z.date(),
      rentAmount: z.number().positive("Rent amount must be greater than 0"),
    })
    .optional(),
  time_listed_on_site: z.number().int().positive(),
  property_owners: z.array(
    z.object({
      owner_address: z.string().min(1, "Owner address is required"),
      amount_owned: z.number().positive("Amount owned must be greater than 0"),
      purchase_time: z.date(),
    }),
  ),
  secondary_market_listings: z.array(
    z.object({
      lister_address: z.string().min(1, "Lister address is required"),
      amount_listed: z
        .number()
        .positive("Amount listed must be greater than 0"),
    }),
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create a type for the form data
export type AddPropertyFormData = z.infer<typeof addPropertySchema>;
