import { ServiceHistory } from "../shared/dataClasses"
import UserAccount from "../entities/userAccount"
import { Service } from "../entities/service"

export class AddToShortlistController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async addToShortlist(
        homeownerID: number,
        cleanerID: number
    ): Promise<void> {
        return await this.userAccount.addToShortlist(homeownerID, cleanerID)
    }
}

export class ViewShortListController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async viewShortlist(homeownerID: number): Promise<string[]> {
        return await this.userAccount.viewShortlist(homeownerID)
    }
}

export class ViewServiceHistoryController {
    private Service: Service

    constructor() {
        this.Service = new Service()
    }

    public async viewServiceHistory(
        userID: number,
        cleanerName: string | null,
        service: string | null,
        date: Date | null
    ): Promise<ServiceHistory[]> {
        return await this.Service.viewServiceHistory(userID, cleanerName, service, date)
    }
}

export class ViewAllServiceHistoryController {
    private Service: Service

    constructor() {
        this.Service = new Service()
    }

    public async viewAllServiceHistory(
        userID: number
    ): Promise<ServiceHistory[]> {
        return await this.Service.viewAllServiceHistory(userID)
    }
}