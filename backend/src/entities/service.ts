import { ServiceProvidedData, ServiceHistory, AllServices } from '../shared/dataClasses'
import { serviceCategoriesTable } from '../db/schema/serviceCategories'
import { servicesProvidedTable } from '../db/schema/servicesProvided'
import { ServiceCategoryNotFoundError } from '../shared/exceptions'
import { serviceBookingsTable } from '../db/schema/serviceBookings'
import { BookingStatus } from '../db/schema/bookingStatusEnum'
import { userAccountsTable } from '../db/schema/userAccounts'
import { drizzle } from 'drizzle-orm/node-postgres'
import { DrizzleClient } from '../shared/constants'
import { and, eq, gt, lt, ilike } from 'drizzle-orm'
export class Service {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    public async createServiceCategory(
        categoryLabel: string
    ): Promise<void> {
        await this.db.insert(serviceCategoriesTable).values({ label: categoryLabel })
    }

    public async viewServiceCategories(): Promise<string[]> {
        const allServiceCategories = await this.db.select().from(serviceCategoriesTable)
        return allServiceCategories.map(sc => sc.label)
    }

    public async viewServicesProvided(
        userID: number,
        serviceName: string | null
    ): Promise<ServiceProvidedData[]> {
        const conditions = [
            eq(userAccountsTable.id, userID)
        ];

        if (serviceName) {
            conditions.push(eq(servicesProvidedTable.serviceName, serviceName));
        }

        const servicesProvidedByCleaner = await this.db
            .select({
                serviceName: servicesProvidedTable.serviceName,
                description: servicesProvidedTable.description,
                price: servicesProvidedTable.price
            })
            .from(servicesProvidedTable)
            .leftJoin(userAccountsTable, eq(
                servicesProvidedTable.cleanerID,
                userAccountsTable.id
            ))
            .where(and(...conditions))

        return servicesProvidedByCleaner.map(sp => {
            return {
                serviceName: sp.serviceName,
                description: sp.description,
                price: Number(sp.price)
            } as ServiceProvidedData
        })
    }

    public async viewAllServicesProvided(
    ): Promise<AllServices[]> {
        const allServicesProvided = await this.db
            .select({
                serviceid: servicesProvidedTable.id,
                serviceName: servicesProvidedTable.serviceName
            })
            .from(servicesProvidedTable)
        return allServicesProvided.map(sp => ({
            serviceName: sp.serviceName,
        }));
    }


    public async updateServiceCategory(
        category: string,
        newCategory: string
    ): Promise<void> {
        await this.db.update(
            serviceCategoriesTable
        ).set({
            label: newCategory
        }).where(
            eq(serviceCategoriesTable.label,
                category))
    }

    public async deleteServiceCategory(
        category: string
    ): Promise<void> {
        const arrayWhereLabelEqualsToCategory = await this.db
            .select()
            .from(serviceCategoriesTable)
            .where(eq(serviceCategoriesTable.label, category))

        if (arrayWhereLabelEqualsToCategory.length === 0) {
            throw new ServiceCategoryNotFoundError("Service Category Not Found")
        }

        await this.db
            .delete(serviceCategoriesTable)
            .where(eq(serviceCategoriesTable.label, category))
    }

    public async searchServiceCategory(
        category: string
    ): Promise<string> {
        const [result] = await this.db
            .select()
            .from(serviceCategoriesTable)
            .where(ilike(serviceCategoriesTable.label, `%${category}%`))

        if (!result) {
            throw new ServiceCategoryNotFoundError("Service Category Not Found")
        }
        return result.label
    }

    public async viewUniqueServicesProvided(): Promise<string[]> {
        const uniqueServices = await this.db
            .select({
                serviceName: servicesProvidedTable.serviceName,
            })
            .from(servicesProvidedTable)
            .groupBy(servicesProvidedTable.serviceName)

        return uniqueServices.map((service) => service.serviceName);
    }

    public async createServiceProvided(
        cleanerID: number,
        serviceName: string,
        serviceCategory: string,
        description: string,
        price: number
    ): Promise<void> {
        const [serviceCategoryEntry] = await this.db
            .select()
            .from(serviceCategoriesTable)
            .where(eq(serviceCategoriesTable.label, serviceCategory))

        if (!serviceCategoryEntry) {
            throw new ServiceCategoryNotFoundError(
                "Service category'" + serviceCategory + "' not found"
            )
        }

        // TODO: Clarify what are the rules of what can or cannot be duplicated
        // const serviceProvidedEntries = await this.db
        //     .select()
        //     .from(servicesProvidedTable)
        //     .where(
        //         and(
        //             eq(servicesProvidedTable.cleanerID, cleanerID),
        //             eq(servicesProvidedTable.serviceName, serviceName),
        //             eq(servicesProvidedTable.serviceCategoryID, serviceCategoryEntry.id)
        //         )
        //     )
        //
        // if (serviceProvidedEntries.length > 0) {
        //     throw new ServiceAlreadyProvidedError(
        //         "Cleaner of ID " + cleanerID + " already provides service '" + serviceName + "'"
        //     )
        // }

        await this.db.insert(servicesProvidedTable).values({
            cleanerID: cleanerID,
            serviceCategoryID: serviceCategoryEntry.id,
            serviceName: serviceName,
            description: description,
            price: price.toString()
        })
    }

    public async viewAllServiceHistory(
        userID: number
    ): Promise<ServiceHistory[]> {
        const results = await this.db
            .select({
                cleanerName: userAccountsTable.username,
                serviceName: servicesProvidedTable.serviceName,
                date: serviceBookingsTable.startTimestamp,
                price: servicesProvidedTable.price,
                status: serviceBookingsTable.status
            })
            .from(serviceBookingsTable)
            .leftJoin(
                servicesProvidedTable,
                eq(serviceBookingsTable.serviceProvidedID, servicesProvidedTable.id)
            )
            .leftJoin(
                userAccountsTable,
                eq(servicesProvidedTable.cleanerID, userAccountsTable.id)
            )
            .where(eq(serviceBookingsTable.homeownerID, userID))

        return results.map(res => {
            return {
                cleanerName: res.cleanerName,
                serviceName: res.serviceName,
                date: res.date,
                price: res.price,
                status: res.status
            } as ServiceHistory
        })
    }

    /**
     * View & Search (by username) Service History filtered by service and date
     */
    public async viewServiceHistory(
        userID: number,
        cleanerName: string | null,
        service: string | null,
        fromDate: Date | string | null,
        toDate: Date | string | null
    ): Promise<ServiceHistory[]> {

        const conditions = [
            eq(serviceBookingsTable.homeownerID, userID),
            eq(serviceBookingsTable.status, BookingStatus.Confirmed)
        ];

        if (service) {
            conditions.push(eq(servicesProvidedTable.serviceName, service));
        }

        if (fromDate) {
            const normalizedFromDate = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
            const startOfFromDay = new Date(normalizedFromDate.setHours(0, 0, 0, 0));

            conditions.push(
                gt(serviceBookingsTable.startTimestamp, startOfFromDay)
            );
        }

        if (toDate) {
            const normalizedToDate = typeof toDate === 'string' ? new Date(toDate) : toDate;
            const startOfToDay = new Date(normalizedToDate.setHours(0, 0, 0, 0));
            const endOfToDay = new Date(startOfToDay);
            endOfToDay.setDate(endOfToDay.getDate() + 1);

            conditions.push(
                lt(serviceBookingsTable.startTimestamp, endOfToDay)
            );
        }

        if (cleanerName) {
            conditions.push(eq(userAccountsTable.username, cleanerName));
        }

        const results = await this.db
            .select({
                cleanerName: userAccountsTable.username,
                serviceName: servicesProvidedTable.serviceName,
                date: serviceBookingsTable.startTimestamp,
                price: servicesProvidedTable.price,
                status: serviceBookingsTable.status
            })
            .from(serviceBookingsTable)
            .leftJoin(
                servicesProvidedTable,
                eq(serviceBookingsTable.serviceProvidedID, servicesProvidedTable.id)
            )
            .leftJoin(
                userAccountsTable,
                eq(servicesProvidedTable.cleanerID, userAccountsTable.id)
            )
            .where(and(...conditions));

        // Handle no results
        if (results.length === 0) {
            throw new Error("No service history found for the given criteria.");
        }

        // Map and return results
        return results.map(res => ({
            cleanerName: res.cleanerName,
            serviceName: res.serviceName,
            date: new Date(res.date),
            price: res.price,
            status: res.status
        }));
    }
}


