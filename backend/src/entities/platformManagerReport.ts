import { serviceCategoriesTable } from '../db/schema/serviceCategories'
import { servicesProvidedTable } from '../db/schema/servicesProvided'
import { serviceBookingsTable } from '../db/schema/serviceBookings'
import { ServiceBookingReportData } from '../shared/dataClasses'
import { userAccountsTable } from '../db/schema/userAccounts'
import { drizzle } from 'drizzle-orm/node-postgres'
import { DrizzleClient } from '../shared/constants'
import { and, eq, gte, lt } from 'drizzle-orm'

export class ServiceBooking {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    public async generateDailyReport(
        myDate: Date
    ): Promise<ServiceBookingReportData[]> {
        const dailyreport = await this.db
            .select({
                bookingID: serviceBookingsTable.id,
                serviceName: serviceCategoriesTable.label,
                cleanerName: userAccountsTable.username,
                price: servicesProvidedTable.price,
                date: serviceBookingsTable.startTimestamp
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
            .where(
                and(
                    gte(serviceBookingsTable.startTimestamp, myDate),
                    lt(
                        serviceBookingsTable.startTimestamp,
                        new Date(myDate.getTime() + 24 * 60 * 60 * 1000)
                    )
                )
            )

        return dailyreport.map(dr => {
            return {
                bookingid: dr.bookingID,
                serviceName: dr.serviceName,
                cleanerName: dr.cleanerName,
                price: Number(dr.price),
                date: dr.date
            } as ServiceBookingReportData
        })
    }
}
