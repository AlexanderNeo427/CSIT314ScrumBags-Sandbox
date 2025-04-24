import { ServiceBooking } from '../entities/platformManagerReport'
import { ServiceBookingReportData } from '../shared/dataClasses'

export class GenerateReportController {
    private serviceBooking: ServiceBooking

    constructor() {
        this.serviceBooking = new ServiceBooking()
    }

    public async generateDailyReport(
        myDate: Date
    ): Promise<ServiceBookingReportData[]> {
        return await this.serviceBooking.generateDailyReport(myDate)
    }
}
