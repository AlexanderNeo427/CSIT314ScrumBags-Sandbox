import { ServiceProvidedData, ServiceHistory } from '../shared/dataClasses'
import { serviceCategoriesTable } from '../db/schema/serviceCategories'
import { servicesProvidedTable } from '../db/schema/servicesProvided'
import { ServiceCategoryNotFoundError } from '../shared/exceptions'
import { serviceBookingsTable } from '../db/schema/serviceBookings'
import { userAccountsTable } from '../db/schema/userAccounts'
import { drizzle } from 'drizzle-orm/node-postgres'
import { DrizzleClient } from '../shared/constants'
import { and, eq, gt, lt } from 'drizzle-orm'

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
        userID: number
    ): Promise<ServiceProvidedData[]> {
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
            .where(eq(userAccountsTable.id, userID))

        return servicesProvidedByCleaner.map(sp => {
            return {
                serviceName: sp.serviceName,
                description: sp.description,
                price: Number(sp.price)
            } as ServiceProvidedData
        })
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
                serviceName: serviceCategoriesTable.label,
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
                serviceCategoriesTable,
                eq(servicesProvidedTable.serviceCategoryID, serviceCategoriesTable.id)
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
        service: string,
        date: Date | string
    ): Promise<ServiceHistory[]> {
        const normalizedDate = typeof date === 'string' ? new Date(date) : date;
        const startOfDay = new Date(normalizedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        // Dynamically build filter conditions
        const conditions = [
            eq(serviceBookingsTable.homeownerID, userID),
            eq(serviceCategoriesTable.label, service),
            gt(serviceBookingsTable.startTimestamp, startOfDay),
            lt(serviceBookingsTable.startTimestamp, endOfDay),
        ];

        // Only add cleanerName filter if provided
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


