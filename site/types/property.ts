import { PropertyType } from "@/constants/properties";
import {z} from "zod";
import type { Properties } from "@/db/collections";

export enum PaymentStatus {
  PAID="paid", 
  PENDING="pending", 
  OVERDUE="overdue", 
  PARTIAL="partial"
}

const step1Schema = z.object({
  //STEP 1: property details
  name: z.string().trim().min(2, "The property name is too short"),
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
    units: z.array(
      z.object({
        name: z
          .string("You must enter unit's name")
          .min(1, "You must enter unit's name"),
      }),
      "You must enter unit details",
    ),
    floors: z
      .int("Floors must be a whole number")
      .gt(0, "An apartment must have at least 1 floor"),
    parkingSpace: z.int("Number of parking spaces must be a whole number"),
    numUnits: z
      .int("Number of units must be a whole number")
      .gt(0, "An apartment must have more than 1 unit"),
  }),
});

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
      number: z
        .string("Invalid phone number")
        .min(1, "Phone number is required")
        .regex(/^(\+254|0)[175]\d{8}$/, "Please enter valid phone number"),
      joinDate: z.date("You must enter the date the tenant joined"),
      payments: z.array(
        z.object({
          date: z.date(),
          amount: z.number(),
          status: z.enum([PaymentStatus.OVERDUE, PaymentStatus.PAID, PaymentStatus.PARTIAL, PaymentStatus.PENDING]),
        }),
      ).optional(),
    })
    .optional().nullable(),
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
        size: z.string("Set file size"),
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
  apartmentDetails:
    appartmentDetailsStepSchema.shape.apartmentDetails.optional(),
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
});

export const singlePropertySchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
})

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

// UI-facing property type with derived fields while retaining full backend document
export interface PropertyDetailView {
  // Full backend document for completeness and future access
  original: Properties;

  // Core identifiers and display
  id: string;
  title: string;
  location: string; // flattened address for UI

  // Hero and gallery
  image: string;
  gallery: string[];

  // Financials (pre-formatted for UI)
  value: string; // e.g., "KSh 1,000,000"
  monthlyRent: string; // e.g., "KSh 25,000"
  yield: string; // e.g., "7.5%"
  minInvestment: string; // e.g., "10% fee"

  // Investment stats
  investors: number;
  availableShares: number; // percent 0-100
  verified: boolean;

  // Description and details (as display strings for current UI)
  description: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  area: string; // e.g., "1200 sq ft"
  yearBuilt: string;
  totalUnits: string | number;
  occupancyRate: string | number;

  // Amenities presented as prettified list
  amenities: string[];

  // Number of tokens in admin account
  tokenBalanceInAdminAccount: number;
}

export const propertyTypeSchema = z.object({
  property_type: z.enum([PropertyType.APARTMENT, PropertyType.SINGLE], "Invalid property type"),
})

// APARTMENT PROPERTY TYPE
export const apartmentStep1Schema = z.object({
  name: z.string().trim().min(2, "Apartment estate name is too short"),
  description: z.string()
    .trim()
    .min(10, "The description should be at least 10 characters"),
  location: z.object({
    address: z.string().trim().min(4, "The address is too short"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
  parking_spaces: z.number().min(0).nullable().optional(),
  serviceFeePercent: z.number().min(0).max(100),
  floors: z.number().int().gt(0, "An apartment must have at least 1 floor"),
});

export const apartmentStep2Schema = z.object({
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.url({ protocol: /^https$/ }),
        type: z.string("Set file type"),
        size: z.string("Set file size"),
      }),
    )
    .min(1, "Upload your legal documents"),
})

export const unitTemplateSchema = z.object({
  name: z.string().trim().min(2, "Template name is too short"),
  gross_unit_size: z
    .number("You must enter size of unit")
    .positive("Property size must be greater than 0"),
  unit_value: z.number("You must enter a unit value").positive("Property value must be greater than 0"),
  proposedRentPerMonth: z
    .number()
    .positive("Proposed rent per month must be greater than 0"),
  amenities: z.object({
    bedrooms: z.number().min(0).nullable().optional(),
    bathrooms: z.number().min(0).nullable().optional(),
    balconies: z.number().min(0).nullable().optional(),
    gym: z.boolean().optional(),
    air_conditioning: z.boolean().optional(),
    heating: z.boolean().optional(),
    furnished: z.boolean().optional(),
    laundry_in_unit: z.boolean().optional(),
    dishwasher: z.boolean().optional(),
    storage_space: z.boolean().optional(),
    pet_friendly: z.boolean().optional(),
    security_system: z.boolean().optional(),
    elevator: z.boolean().optional(),
    garden_yard: z.boolean().optional(),
  }),
  images: z
    .array(z.url({ protocol: /^https$/ }))
    .min(1, "At least one image of the property is required"),
})

export const apartmentStep3Schema = z.object({
  unit_templates: z.array(unitTemplateSchema).min(1, "At least one unit template is required"),
});

export const unitSchema = z.object({
  name: z.string().trim().min(2, "Unit name is too short"),
  template_name: z.string().trim().min(2, "Select a template"),
  floor: z.number().int().min(1, "Floor must be at least 1"),
});
export const apartmentStep4Schema = z.object({
  units: z.array(unitSchema)
});

export const appartmentStepSchemas = {
  step1: apartmentStep1Schema,
  step2: apartmentStep2Schema,
  step3: apartmentStep3Schema,
  step4: apartmentStep4Schema,
}

export const addAppartmentSchema = z.object({
  ...apartmentStep1Schema.shape,
  ...apartmentStep2Schema.shape,
  ...apartmentStep3Schema.shape,
  ...apartmentStep4Schema.shape,
})

export const createPropertySchema = z.object({
  ...propertyTypeSchema.shape,
  single_property_details: singlePropertySchema.optional(),
  apartment_property_details: addAppartmentSchema.optional(),
});

export type CreatePropertyType = z.infer<typeof createPropertySchema>;
