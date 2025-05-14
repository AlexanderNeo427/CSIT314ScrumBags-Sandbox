import { AllServices, ServiceProvidedData } from "../shared/dataClasses"
import { serviceCategoriesTable } from "../db/schema/serviceCategories"
import { servicesProvidedTable } from "../db/schema/servicesProvided"
import { userAccountsTable } from "../db/schema/userAccounts"
import { drizzle } from "drizzle-orm/node-postgres"
import { DrizzleClient } from "../shared/constants"
import { and, eq } from "drizzle-orm"

export class ServiceProvided {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    /**
     * US-13: As a cleaner, I want to create my service so 
     *        that homeowners can view my services provided 
     */
    public async createServiceProvided(
        cleanerID: number,
        serviceName: string,
        serviceCategory: string,
        description: string,
        price: number
    ): Promise<boolean> {
        try {
            const [serviceCategoryEntry] = await this.db
                .select()
                .from(serviceCategoriesTable)
                .where(eq(serviceCategoriesTable.label, serviceCategory))

            if (!serviceCategoryEntry) { // Service category doesn't exist
                return false
            }

            const result = await this.db
                .select({ cleaner: userAccountsTable.username })
                .from(servicesProvidedTable)
                .leftJoin(userAccountsTable, eq(
                    servicesProvidedTable.cleanerID,
                    userAccountsTable.id
                ))
                .where(and(
                    eq(servicesProvidedTable.cleanerID, cleanerID),
                    eq(servicesProvidedTable.serviceName, serviceName),
                    eq(servicesProvidedTable.serviceCategoryID, serviceCategoryEntry.id)
                ))

            if (result.length > 0) { // Service already provided
                return false
            }

            await this.db.insert(servicesProvidedTable).values({
                cleanerID: cleanerID,
                serviceCategoryID: serviceCategoryEntry.id,
                serviceName: serviceName,
                description: description,
                price: price.toString()
            })
            return true
        } catch (err) {
            return false
        }
    }

    /**
     * US-14: As a cleaner, I want to view my service 
     *        so that I can check on my services provided
     * 
     * Gets all the service 'types' provided by a cleaner (by their userID)
     */
    public async viewServicesProvided(cleanerID: number): Promise<ServiceProvidedData[]> {
        try {
            const servicesProvidedByCleaner = await this.db
                .select({
                    serviceProvidedID: servicesProvidedTable.id,
                    serviceName: servicesProvidedTable.serviceName,
                    description: servicesProvidedTable.description,
                    price: servicesProvidedTable.price
                })
                .from(servicesProvidedTable)
                .leftJoin(userAccountsTable, eq(
                    servicesProvidedTable.cleanerID,
                    userAccountsTable.id
                ))
                .where(eq(userAccountsTable.id, cleanerID))

            return servicesProvidedByCleaner.map(sp => {
                return {
                    serviceProvidedID: sp.serviceProvidedID,
                    serviceName: sp.serviceName,
                    description: sp.description,
                    price: Number(sp.price)
                } as ServiceProvidedData
            })
        } catch (err) {
            return []
        }
    }

    /**
     * US-15: As a cleaner, I want to update my service so  
     *        that I can make changes to my service provided.
     */
    public async updateServiceProvided(
        serviceID: number,
        newserviceName: string,
        newdescription: string,
        newprice: number
    ): Promise<boolean> {
        try {
            if (newserviceName.trim().length === 0 || newprice <= 0) {
                return false
            }

            await this.db
                .update(servicesProvidedTable)
                .set({
                    serviceName: newserviceName,
                    description: newdescription,
                    price: String(newprice)
                }).where(eq(servicesProvidedTable.id, serviceID))
            return true
        } catch (err) {
            return false
        }
    }

    /**
     * US-16: As a cleaner, I want to delete my service 
     *        so that I can remove my service provided
     */
    public async deleteServiceProvided(serviceID: number): Promise<boolean> {
        try {
            await this.db
                .delete(servicesProvidedTable)
                .where(eq(servicesProvidedTable.id, serviceID))
            return true
        } catch (err) {
            return false
        }
    }

    /**
     * US-17: As a cleaner, I want to search my service so 
     *        that I can look up a specific service I provide
     */
    public async searchServicesProvided(
        id: number,
        serviceName: string
    ): Promise<ServiceProvidedData[]> {
        try {
            const conditions = [eq(userAccountsTable.id, id)]
            if (serviceName) {
                conditions.push(eq(servicesProvidedTable.serviceName, serviceName))
            }
            const servicesProvidedByCleaner = await this.db
                .select({
                    serviceProvidedID: servicesProvidedTable.id,
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
                    serviceProvidedID: sp.serviceProvidedID,
                    serviceName: sp.serviceName,
                    description: sp.description,
                    price: Number(sp.price)
                } as ServiceProvidedData
            })
        } catch (err) {
            return []
        }
    }

    public async viewAllServicesProvided(): Promise<AllServices[]> {
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
}