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