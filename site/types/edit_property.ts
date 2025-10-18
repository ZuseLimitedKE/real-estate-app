import { PaymentStatus } from "./property"

export interface EditPropertyDetails {
    single_property_details?: {
        tenant?: EditPropertyTenantDetails,
        payments: EditPropertyPayments[]
    },
    apartment_details?: {
        num_floors: number,
        parking_spaces: number,
        units: {
            name: string,
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