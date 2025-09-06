import z from "zod";

const step1Schema = z.object({
  //STEP 1: property details
  name: z.string().min(3, "Property title is required"),
  description: z
    .string()
    .min(10, "Description should be at least 10 characters"),
  gross_property_size: z
    .number()
    .positive("Property size must be greater than 0"),
  amenities: z.object({
    bed: z.number().positive().nullable(),
    bath: z.number().positive().nullable(),
  }),
});

const step2Schema = z.object({
  // STEP 2 : location info
  location: z.object({
    address: z.string().min(5, "Address is required"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
});

const step3Schema = z.object({
  //STEP 3: tenant info
  tenant: z
    .object({
      address: z.string().min(1, "Tenant address is required"),
      rentDate: z.date(),
      rentAmount: z.number().positive("Rent amount must be greater than 0"),
    })
    .optional(),
});
const step4Schema = z.object({
  // STEP 4: financial info
  proposedRentPerMonth: z
    .number()
    .positive("Proposed rent per month must be greater than 0"),
  serviceFeePercent: z.number().min(0).max(100),
  property_value: z.number().positive("Property value must be greater than 0"),
});
const step5Schema = z.object({
  // STEP 5 : property images
  images: z
    .array(z.url({ protocol: /^https$/ }))
    .min(1, "At least one image of the property is required"),
});
const step6Schema = z.object({
  //STEP 6 : legal documents (title deed , appraisal documents)
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.url({ protocol: /^https$/ }),
      }),
    )
    .min(1, "Upload your legal documents"),
});
const step7Schema = z.object({
  //EMPTY ARRAY INITIALLY
  property_owners: z.array(
    z.object({
      owner_address: z.string().min(1, "Owner address is required"),
      amount_owned: z.number().positive("Amount owned must be greater than 0"),
      purchase_time: z.date(),
    }),
  ),
  //EMPTY ARRAY INITIALLY

  secondary_market_listings: z.array(
    z.object({
      lister_address: z.string().min(1, "Lister address is required"),
      amount_listed: z
        .number()
        .positive("Amount listed must be greater than 0"),
    }),
  ),

  property_status: z.enum(["pending", "approved", "rejected"]),
  // comes from auth token
  agencyId: z.string().min(1, "Invalid agency id"),
  //comes from the smart contract
  token_address: z.string().min(1, "Token address is required"),
  //set when submitting
  createdAt: z.date(),
  updatedAt: z.date(),
  time_listed_on_site: z.number().int().positive(),
});
export const addPropertySchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
});

export const stepSchemas = {
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
} as const;

// Create a type for the form data
export type AddPropertyFormData = z.infer<typeof addPropertySchema>;
