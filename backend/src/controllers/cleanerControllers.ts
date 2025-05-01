import { CleanerServicesData, CleanerServiceBookingData } from '../shared/dataClasses'
import UserAccount from '../entities/userAccount'
import { ServiceBooking } from '../entities/serviceBooking'

export class ViewCleanersController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async viewCleaners(
        cleanerName: string | null
    ): Promise<CleanerServicesData[]> {
        return await this.userAccount.viewCleaners(cleanerName)
    }
}

export class ViewCleanerServiceHistoryController {
    private serviceBooking: ServiceBooking

    constructor() {
        this.serviceBooking = new ServiceBooking()
    }

    public async viewCleanerServiceHistory(
        cleanerID: number,
        startDate: Date | null,
        endDate: Date | null
    ): Promise<CleanerServiceBookingData[]> {
        return await this.serviceBooking.viewCleanerServiceHistory(cleanerID, startDate, endDate)
    }
}

export class SearchCleanerServiceHistoryController {
    private serviceBooking: ServiceBooking

    constructor() {
        this.serviceBooking = new ServiceBooking()
    }

    public async searchCleanerServiceHistory(
        cleanerID: number,
        service: string,
        startDate: Date | null,
        endDate: Date | null
    ): Promise<CleanerServiceBookingData[]> {
        return await this.serviceBooking.searchCleanerServiceHistory(cleanerID, service, startDate, endDate)
    }
}