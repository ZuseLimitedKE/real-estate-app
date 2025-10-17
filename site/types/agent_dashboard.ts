export interface DashboardProperties {
    single?: {
        id: string,
        image: string | null,
        name: string,
        status: string,
        location: string,
        details: {
            title: string,
            value: string
        }[],
        rent: number,
    },
    apartment?: {
        id: string,
        status: string,
        location: string,
        name: string,
        unit_templates: {
            image: string | null,
            name: string,
            details: {
                title: string,
                value: string
            }[],
            numUnits: number,
            rent: number,
        }[]
    }
}

export interface AgentDashboardTenantsData {
    name: string,
    property: string,
    rent: number,
    status: string,
    contactInfo: {
        email: string,
        number: string
    },
    leaseInfo: {
        property: string,
        initialDate: Date
    },
    paymentHistory: {
        date: Date,
        amount: number,
        status: string
    }[]
}

export enum AMENITIES {
    PARKING = 'parking',
    SWIMMING = 'swimming pool',
    FITNESS = 'fitness center',
    AIR_CONDITIONING = 'air conditioning',
    HEATING = 'heating',
    LAUNDRY = 'laundry in unit',
    DISHWASHER = 'dishwasher',
    FIREPLACE = 'fireplace',
    STORAGE = 'storage',
    PET_FRIENDLY = 'pet friendly',
    SECURITY = 'security system',
    ELEVATOR = 'elevator',
    GARDEN = 'garden yard',
    BEDROOM = 'bedroom',
    BATHROOM = 'bathroom',
    BALCONY = 'balcony',
    FURNISHED = 'furnished'
}

export interface AgentProperty {
    name: string,
    address: string,
    status: string,
    images: string[],
    overview: AgentPropertyOverview,
    financials: AgentPropertyFinances,
    documents: AgentPropertyDocument[],
    tenants: AgentPropertyTenants[]
}

export interface AgentPropertyOverview {
    propertyDetails: {
        type: string,
        size: number,
        units?: number,
        floors?: number,
        parkingSpace?: number,
        createdAt: Date
    },
    occupancy?: {
        occupied: number,
        monthlyRevenue: number,
        totalUnits: number,
        rate: number
    },
    about: string,
    amenities: AMENITIES[],
}

export interface AgentPropertyFinances {
    propertyValue: number,
    expectedYield: number,
    monthlyRevenue: number,
    annualRevenue: number,
    roi: number,
}

export interface AgentPropertyDocument {
    name: string,
    type: string,
    size: string,
    url: string
}

export interface AgentPropertyTenants {
    name: string,
    unit?: string,
    rent: number,
    joinDate: Date,
    paymentHistory: {
        date: Date,
        amount: number,
        status: string
    }[]
}