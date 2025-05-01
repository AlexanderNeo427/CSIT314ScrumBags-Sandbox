import { BookingStatus } from "../db/schema/bookingStatusEnum"

export type UserAccountData = {
    id: number
    username: string
    userProfile: string
    isSuspended: boolean
}

export type ServiceProvidedData = {
    serviceName: string
    description: string
    price: number
}

export type ServiceBookingReportData = {
    bookingid: number
    serviceName: string
    cleanerName: string
    price: number
    date: Date
}
export type CleanerServiceBookingData = {
    bookingid: number
    serviceName: string
    date: Date
    homeOwnerName: string
}
export type ServiceData = {
    label: string
    category: string
}
export type AllServices = {
    serviceName: string
}

export type CleanerServicesData = {
    cleanerID: number
    cleaner: string
    service: string
    price: number
}

export type ServiceHistory = {
    cleanerName: string | null;
    serviceName: string | null;
    date: Date;
    price: string | null;
    status: BookingStatus;
};
