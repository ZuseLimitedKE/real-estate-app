import { PropertyType } from "@/constants/properties";
import z from "zod";

const step1Schema = z.object({
  //STEP 1: property details
  name: z.string().trim().min(2, "The property name is too short"),
  type: z.enum([PropertyType.APARTMENT, PropertyType.SINGLE], "Invalid property type"),
  description: z
    .string()
    .trim()
    .min(10, "The description should be at least 10 characters"),
  gross_property_size: z
    .number()
    .positive("Property size must be greater than 0"),
  amenities: z.object({
    bedrooms: z.number().min(0).nullable().optional(),
    bathrooms: z.number().min(0).nullable().optional(),
    parking_spaces: z.number().min(0).nullable().optional(),
    balconies: z.number().min(0).nullable().optional(),
    swimming_pool: z.boolean().optional(),
    gym: z.boolean().optional(),
    air_conditioning: z.boolean().optional(),
    heating: z.boolean().optional(),
    laundry_in_unit: z.boolean().optional(),
    dishwasher: z.boolean().optional(),
    fireplace: z.boolean().optional(),
    storage_space: z.boolean().optional(),
    pet_friendly: z.boolean().optional(),
    security_system: z.boolean().optional(),
    elevator: z.boolean().optional(),
    garden_yard: z.boolean().optional(),
  }),
});

const appartmentDetailsStepSchema = z.object({
  apartmentDetails: z.object({
    units: z.array(z.object({
      name: z.string("You must enter unit's name").min(1, "You must enter unit's name")
    }), "You must enter unit details"),
    floors: z.int("Floors must be a whole number").gt(0, "An apartment must have at least 1 floor"),
    parkingSpace: z.int("Number of parking spaces must be a whole number"),
    numUnits: z.int("Number of units must be a whole number").gt(0, "An apartment must have more than 1 unit")
  })
})

const step2Schema = z.object({
  // STEP 2 : location info
  location: z.object({
    address: z.string().trim().min(4, "The address is too short"),
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
      address: z.string().trim().min(2, "Tenant address is required"),

      rentAmount: z.number().positive("Rent amount must be greater than 0"),
      rentDate: z
        .number()
        .min(1, "Day must be between 1 and 31")
        .max(31, "Day must be between 1 and 31"),
      name: z.string("Enter tenant's name"),
      email: z.email("Enter a valid email"),
      number: z.string("Invalid phone number").min(1, "Phone number is required").regex(/^(\+254|0)[175]\d{8}$/, "Please enter valid phone number"),
      joinDate: z.date("You must enter the date the tenant joined"),
      payments: z.array(z.object({
        date: z.date(),
        amount: z.number(),
        status: z.string()
      })).optional().default([])
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
        type: z.string("Set file type"),
        size: z.string("Set file size")
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
  apartmentDetails: appartmentDetailsStepSchema.shape.apartmentDetails.optional(),
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
});

export const stepSchemas = {
  step1: step1Schema,
  apartmentsStep: appartmentDetailsStepSchema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
} as const;

// Create a type for the form data
export type AddPropertyFormData = z.infer<typeof addPropertySchema>;
