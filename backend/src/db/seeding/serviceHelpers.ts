import { ServiceBookingsInsert, serviceBookingsTable } from '../schema/serviceBookings'
import { BookingStatus } from '../schema/bookingStatusEnum'
import { UserAccountsSelect } from '../schema/userAccounts'
import { DrizzleClient } from '../../shared/constants'
import { faker } from '@faker-js/faker'
import {
    ServiceCategoriesSelect,
    serviceCategoriesTable
} from '../schema/serviceCategories'
import {
    ServicesProvidedInsert,
    ServicesProvidedSelect,
    servicesProvidedTable
} from '../schema/servicesProvided'

export const initServiceCategories = async (
    db: DrizzleClient,
    serviceCategories: string[]
): Promise<ServiceCategoriesSelect[]> => {

    return await db
        .insert(serviceCategoriesTable)
        .values(serviceCategories.map(sc => {
            return { label: sc }
        }))
        .returning()
}

export const initServicesProvided = async (
    db: DrizzleClient,
    allCleaners: UserAccountsSelect[],
    allServiceCategories: ServiceCategoriesSelect[],
    allServiceNames: string[]
): Promise<ServicesProvidedSelect[]> => {

    const servicesProvidedToInsert: ServicesProvidedInsert[] = []

    for (const cleaner of allCleaners) {
        const randServiceCats = faker.helpers.arrayElements(allServiceCategories, {
            min: 1, max: allServiceCategories.length
        })
        const randServices = faker.helpers.shuffle(
            faker.helpers.arrayElements(
                allServiceNames,
                randServiceCats.length
            )
        )

        for (let i = 0; i < randServiceCats.length; i++) {
            servicesProvidedToInsert.push({
                cleanerID: cleaner.id as number,
                serviceCategoryID: randServiceCats[i].id as number,
                serviceName: randServices[i],
                description: faker.commerce.productDescription(),
                price: faker.number
                    .float({
                        min: 20,
                        max: 400,
                        fractionDigits: 2
                    })
                    .toString()
            } as ServicesProvidedInsert)
        }
    }

    if (servicesProvidedToInsert.length === 0) {
        return []
    }
    return await db
        .insert(servicesProvidedTable)
        .values(servicesProvidedToInsert)
        .onConflictDoNothing()
        .returning()
}

export const initServiceBookings = async (
    db: DrizzleClient,
    allHomeowners: UserAccountsSelect[],
    allServicesProvided: ServicesProvidedSelect[],
): Promise<void> => {

    const bookingsToInsert: ServiceBookingsInsert[] = []
    allHomeowners.forEach(ho => {
        faker.helpers.arrayElements(allServicesProvided, {
            min: 1, max: allServicesProvided.length
        }).forEach(sp => {
            bookingsToInsert.push({
                homeownerID: ho.id,
                serviceProvidedID: sp.id,
                startTimestamp: faker.date.anytime(),
                status: faker.helpers.arrayElement([
                    BookingStatus.Requested,
                    BookingStatus.Accepted,
                    BookingStatus.Rejected,
                    BookingStatus.Pending,
                    BookingStatus.Cancelled,
                    BookingStatus.Done
                ])
            })
        })
    })

    await db.insert(serviceBookingsTable).values(bookingsToInsert)
}