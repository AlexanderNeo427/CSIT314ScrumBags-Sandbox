import { shortlistedServicesTable } from "../db/schema/shortlistedServices"
import { ServiceAlreadyShortlistedError } from "../shared/exceptions"
import { servicesProvidedTable } from "../db/schema/servicesProvided"
import { userAccountsTable } from "../db/schema/userAccounts"
import { ShortlistData } from "../shared/dataClasses"
import { drizzle } from "drizzle-orm/node-postgres"
import { DrizzleClient } from "../shared/constants"
import { and, count, eq } from "drizzle-orm"

export class ShortlistedServices {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    /**
     * US-21: As a cleaner, I want to know the number of homeowners that shortlisted 
     *        me for my services, so that I can track my popularity and potential bookings
     */
    public async viewNoOfShortlistedHomeowners(
        serviceProvidedID: number
    ): Promise<number> {
        try {
            const [res] = await this.db
                .select({ count: count() })
                .from(shortlistedServicesTable)
                .where(eq(shortlistedServicesTable.serviceProvidedID, serviceProvidedID))

            if (!res) {
                return 0
            }

            return res.count
        } catch (err) {
            return 0
        }
    }

    /**
     * US-26: As a homeowner, I want to save the cleaners into my short list 
     *        so that I can have an easier time for future reference
     */
    public async addToShortlist(
        homeownerID: number,
        serviceProvidedID: number
    ): Promise<boolean> {
        try {
            const result = await this.db
                .select()
                .from(shortlistedServicesTable)
                .leftJoin(userAccountsTable, eq(
                    shortlistedServicesTable.serviceProvidedID,
                    userAccountsTable.id
                ))
                .where(and(
                    eq(shortlistedServicesTable.homeownerID, homeownerID),
                    eq(shortlistedServicesTable.serviceProvidedID, serviceProvidedID)
                ))
                .limit(1)

            if (result.length > 0) {
                console.log("Already shortlisted service")
                return false
            }

            await this.db
                .insert(shortlistedServicesTable)
                .values({
                    homeownerID: homeownerID,
                    serviceProvidedID: serviceProvidedID
                })
            return true
        } catch (err) {
            return false
        }
    }

    /**
     * US-28: As a homeowner, I want to view my shortlist so that I 
     *        can have an easy time looking for a cleaner or service
     */
    public async viewShortlist(homeownerID: number): Promise<ShortlistData[]> {
        try {
            const shortlistedCleaners = await this.db
                .select({
                    cleanerName: userAccountsTable.username,
                    serviceName: servicesProvidedTable.serviceName
                })
                .from(shortlistedServicesTable)
                .leftJoin(servicesProvidedTable, eq(
                    shortlistedServicesTable.serviceProvidedID,
                    servicesProvidedTable.id
                ))
                .leftJoin(userAccountsTable, eq(
                    servicesProvidedTable.cleanerID,
                    userAccountsTable.id
                ))
                .where(eq(shortlistedServicesTable.homeownerID, homeownerID))

            return shortlistedCleaners.map(entry => ({
                cleanerName: entry.cleanerName ?? 'Unknown',
                serviceName: entry.serviceName ?? 'Unknown',
            }))
        } catch (err) {
            return []
        }
    }

    /**
     * US-27: As a homeowner, I want to search through my shortlist so that 
     *        I can find a specific cleaner or service I want
     */
    public async searchShortlist(
        homeownerID: number,
        search: string
    ): Promise<ShortlistData[]> {
        try {
            const shortlistedCleaners = await this.db
                .select({
                    cleanerName: userAccountsTable.username,
                    serviceName: servicesProvidedTable.serviceName
                })
                .from(shortlistedServicesTable)
                .leftJoin(servicesProvidedTable, eq(
                    shortlistedServicesTable.serviceProvidedID,
                    servicesProvidedTable.id
                ))
                .leftJoin(userAccountsTable, eq(
                    servicesProvidedTable.cleanerID,
                    userAccountsTable.id
                ))
                .where(and(
                    eq(shortlistedServicesTable.homeownerID, homeownerID),
                    eq(servicesProvidedTable.serviceName, search),
                ))

            return shortlistedCleaners.map(entry => ({
                cleanerName: entry.cleanerName ?? 'Unknown',
                serviceName: entry.serviceName ?? 'Unknown',
            }))
        } catch (err) {
            return []
        }
    }
}