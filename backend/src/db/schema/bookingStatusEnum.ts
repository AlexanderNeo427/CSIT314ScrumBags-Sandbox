import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * This plain Typescript enum will be the authoritative entity 
 * that decides what are the different possible 'states' a booking can be in
 * 
 * If you decide to add one into this enum, just ensure that 
 * you also add that entry into the 'bookingStatusEnum' pgEnum below
 */
export enum BookingStatus {
    Requested = 'requested',
    Accepted = 'accepted',
    Rejected = 'rejected',
    Pending = 'pending',
    Cancelled = 'cancelled',
    Done = 'done'
}

export const bookingStatusEnum = pgEnum('booking_status', [
    BookingStatus.Requested,
    BookingStatus.Accepted,
    BookingStatus.Rejected,
    BookingStatus.Pending,
    BookingStatus.Cancelled,
    BookingStatus.Done
])
