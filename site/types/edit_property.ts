import { PaymentStatus } from "./property"

export interface EditPropertyDetails {
    single_property_details?: {
        tenant?: EditPropertyTenantDetails,
        payments: EditPropertyPayments[]
    },
    apartment_details?: {
        templates: {
            id: string;
            amenities: {
                bedrooms?: number;
                bathrooms?: number;
                balconies?: number;
                gym?: boolean;
                air_conditioning?: boolean;
                heating?: boolean;
                laundry_in_unit?: boolean;
                dishwasher?: boolean;
                storage_space?: boolean;
                security_system?: boolean;
                elevator?: boolean;
                pet_friendly?: boolean;
                furnished?: boolean;
            },
            gross_size: number;
            proposedRentPerMonth: number;
            unitValue: number;
            images: string[];
            name: string;
        }[],
        num_floors: number,
        parking_spaces: number,
        units: {
            id: string;
            token_details: {
                address: string;
                total_fractions: number;
            };
            owner?: {
                investor_address: string;
                fractions_owned: number;
                purchase_time: Date;
            }[],
            secondary_market_listings: {
                lister_address: string;
                amount_listed: number;
            }[];
            name: string,
            templateID: string,
            floor: number
            tenant?: EditPropertyTenantDetails,
            payments: EditPropertyPayments[]
        }[]
    }
}

interface EditPropertyTenantDetails {
    rentDate: number,
    name: string,
    email: string,
    number: string,
    rentAmount: number,
    address: string,
    joinDate: Date
}

interface EditPropertyPayments {
    date: Date;
    amount: number;
    status: PaymentStatus;
}