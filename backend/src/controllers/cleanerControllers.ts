import { CleanerServicesData } from '../shared/dataClasses'
import UserAccount from '../entities/userAccount'

export class ViewCleanersController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async viewCleaners(): Promise<CleanerServicesData[]> {
        return await this.userAccount.viewCleaners()
    }
}
