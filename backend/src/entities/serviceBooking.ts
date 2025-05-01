import { CleanerServiceBookingData, ServiceBookingReportData } from '../shared/dataClasses'
import { serviceCategoriesTable } from '../db/schema/serviceCategories'
import { servicesProvidedTable } from '../db/schema/servicesProvided'
import { serviceBookingsTable } from '../db/schema/serviceBookings'
import { BookingStatus } from '../db/schema/bookingStatusEnum'
import { userAccountsTable } from '../db/schema/userAccounts'
import { DrizzleClient } from '../shared/constants'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, gte, ilike, lt } from 'drizzle-orm'

export class ServiceBooking {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    public async generateDailyReport(
        startDate: Date
    ): Promise<ServiceBookingReportData[]> {
        const startOfNextDay = new Date(startDate)
        startOfNextDay.setDate(startDate.getDate() + 1)

        const dailyReport = await this.db
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
                    gte(serviceBookingsTable.startTimestamp, startDate),
                    lt(serviceBookingsTable.startTimestamp, startOfNextDay)
                )
            )

        return dailyReport.map(dr => {
            return {
                bookingid: dr.bookingID,
                serviceName: dr.serviceName,
                cleanerName: dr.cleanerName,
                price: Number(dr.price),
                date: dr.date
            } as ServiceBookingReportData
        })
    }

    public async generateWeeklyReport(
        startDate: Date
    ): Promise<ServiceBookingReportData[]> {
        const startOfNextWeek = new Date(startDate)
        startOfNextWeek.setDate(startOfNextWeek.getDate() + 7)

        const weeklyReport = await this.db
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
                    gte(serviceBookingsTable.startTimestamp, startDate),
                    lt(serviceBookingsTable.startTimestamp, startOfNextWeek)
                )
            )

        return weeklyReport.map(wr => {
            return {
                bookingid: wr.bookingID,
                serviceName: wr.serviceName,
                cleanerName: wr.cleanerName,
                price: Number(wr.price),
                date: wr.date
            } as ServiceBookingReportData
        })
    }

    public async generateMonthlyReport(
        startDate: Date
    ): Promise<ServiceBookingReportData[]> {
        const date = new Date(startDate)
        const nextMonth = new Date(date.setMonth(startDate.getMonth() + 1))

        const monthlyReport = await this.db
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
                    gte(serviceBookingsTable.startTimestamp, startDate),
                    lt(
                        serviceBookingsTable.startTimestamp,
                        nextMonth
                    )
                )
            )
        return monthlyReport.map(mr => {
            return {
                bookingid: mr.bookingID,
                serviceName: mr.serviceName,
                cleanerName: mr.cleanerName,
                price: Number(mr.price),
                date: mr.date
            } as ServiceBookingReportData
        })
    }

    public async viewCleanerServiceHistory(
        cleanerID: number,
        startDate: Date | null,
        endDate: Date | null
    ): Promise<CleanerServiceBookingData[]> {

        const conditions = [
            eq(servicesProvidedTable.cleanerID, cleanerID),
            eq(serviceBookingsTable.status, BookingStatus.Confirmed)
        ]

        if (startDate && endDate) {
            conditions.push(gte(serviceBookingsTable.startTimestamp, startDate))
            conditions.push(lt(serviceBookingsTable.startTimestamp, endDate))
        }

        const queryResult = await this.db.select()
            .from(serviceBookingsTable)
            .leftJoin(
                servicesProvidedTable,
                eq(serviceBookingsTable.serviceProvidedID, servicesProvidedTable.id)
            )
            .leftJoin(
                userAccountsTable,
                eq(serviceBookingsTable.homeownerID, userAccountsTable.id)
            )
            .leftJoin(
                serviceCategoriesTable,
                eq(servicesProvidedTable.serviceCategoryID, serviceCategoriesTable.id)
            )
            .where(and(...conditions))

        return queryResult.map(qr => {
            return {
                bookingid: qr.service_bookings.id,
                status: qr.service_bookings.status,
                serviceName: qr.services_provided?.serviceName,
                date: qr.service_bookings.startTimestamp,
                homeOwnerName: qr.user_accounts?.username
            } as CleanerServiceBookingData
        })
    }

    public async searchCleanerServiceHistory(
        cleanerID: number,
        service: string,
        startDate: Date | null,
        endDate: Date | null
    ): Promise<CleanerServiceBookingData[]> {

        const conditions = [
            eq(servicesProvidedTable.cleanerID, cleanerID),
            eq(serviceBookingsTable.status, BookingStatus.Confirmed),
            ilike(servicesProvidedTable.serviceName, `%${service}%`)
        ]

        if (startDate && endDate) {
            conditions.push(gte(serviceBookingsTable.startTimestamp, startDate))
            conditions.push(lt(serviceBookingsTable.startTimestamp, endDate))
        }

        const queryResult = await this.db.select()
            .from(serviceBookingsTable)
            .leftJoin(
                servicesProvidedTable,
                eq(serviceBookingsTable.serviceProvidedID, servicesProvidedTable.id)
            )
            .leftJoin(
                userAccountsTable,
                eq(serviceBookingsTable.homeownerID, userAccountsTable.id)
            )
            .leftJoin(
                serviceCategoriesTable,
                eq(servicesProvidedTable.serviceCategoryID, serviceCategoriesTable.id)
            )
            .where(and(...conditions))

        return queryResult.map(qr => {
            return {
                bookingid: qr.service_bookings.id,
                status: qr.service_bookings.status,
                serviceName: qr.services_provided?.serviceName,
                date: qr.service_bookings.startTimestamp,
                homeOwnerName: qr.user_accounts?.username
            } as CleanerServiceBookingData
        })
    }
}
