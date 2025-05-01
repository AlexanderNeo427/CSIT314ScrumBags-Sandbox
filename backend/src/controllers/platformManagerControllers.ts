import { ServiceBookingReportData } from '../shared/dataClasses'
import { ServiceBooking } from '../entities/serviceBooking'

export class GenerateDailyReportController {
    private serviceBooking: ServiceBooking

    constructor() {
        this.serviceBooking = new ServiceBooking()
    }

    public async generateDailyReport(
        startDate: Date
    ): Promise<ServiceBookingReportData[]> {
        return await this.serviceBooking.generateDailyReport(startDate)
    }
}

export class GenerateWeeklyReportController {
    private serviceBooking: ServiceBooking

    constructor() {
        this.serviceBooking = new ServiceBooking()
    }

    public async generateWeeklyReport(
        startDate: Date
    ): Promise<ServiceBookingReportData[]> {
        return await this.serviceBooking.generateWeeklyReport(startDate)
    }
}
export class GenerateMonthlyReportController {
    private serviceBooking: ServiceBooking

    constructor() {
        this.serviceBooking = new ServiceBooking()
    }

    public async generateMonthlyReport(
        startDate: Date
    ): Promise<ServiceBookingReportData[]> {
        return await this.serviceBooking.generateMonthlyReport(startDate)
    }
}
