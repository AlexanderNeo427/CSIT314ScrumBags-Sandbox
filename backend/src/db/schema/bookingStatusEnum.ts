import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * This plain Typescript enum will be the authoritative entity 
 * that decides what are the different possible 'states' a booking can be in
 * 
 * If you decide to add one into this enum, just ensure that 
 * you also add that entry into the 'bookingStatusEnum' pgEnum below
 */
export enum BookingStatus {
    Pending = 'pending',
    Cancelled = 'cancelled',
    Confirmed = 'confirmed'
}

export const bookingStatusEnum = pgEnum('booking_status', [
    BookingStatus.Pending,
    BookingStatus.Cancelled,
    BookingStatus.Confirmed,
])
