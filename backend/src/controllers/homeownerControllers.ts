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

export class ViewShortlistController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async viewShortlist(homeownerID: number): Promise<string[]> {
        return await this.userAccount.viewShortlist(homeownerID)
    }
}

export class SearchShortlistController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async searchShortlist(
        homeownerID: number,
        search: string
    ): Promise<string[]> {
        return await this.userAccount.searchShortlist(homeownerID, search)
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
        fromDate: Date | string | null,
        toDate: Date | string | null
    ): Promise<ServiceHistory[]> {
        return await this.Service.viewServiceHistory(
            userID, cleanerName, service, fromDate, toDate
        )
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