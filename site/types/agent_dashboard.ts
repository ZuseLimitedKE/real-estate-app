export interface DashboardProperties {
    id: string,
    image: string,
    name: string,
    status: string,
    location: string,
    details: {
        title: string,
        value: string
    }[],
    rent: number,
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
    WIFI = 'wifi',
    PARKING = 'parking',
    SWIMMING = 'swimming pool',
    FITNESS = 'fitness center',

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