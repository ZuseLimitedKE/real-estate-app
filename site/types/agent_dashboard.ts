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