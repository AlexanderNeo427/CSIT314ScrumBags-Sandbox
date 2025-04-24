import { UserAccountData } from '../shared/dataClasses'
import UserAccount from '../entities/userAccount'
import { GLOBALS } from '../shared/constants'
import bcrypt from 'bcrypt'

export class ViewUserAccountsController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async viewUserAccounts(
        username: string | null
    ): Promise<UserAccountData[]> {
        return await this.userAccount.viewUserAccounts(username)
    }
}

export class LoginController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async login(
        username: string,
        password: string
    ): Promise<UserAccountData> {
        return await this.userAccount.login(username, password)
    }
}

export class CreateNewUserAccountController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    /**
     * @param password The PLAINTEXT password (not encoded)
     */
    public async createNewUserAccount(
        createAs: string,
        username: string,
        password: string
    ): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(password, GLOBALS.SALT_ROUNDS)
        return await this.userAccount.createNewUserAccount(
            createAs,
            username,
            hashedPassword
        )
    }
}

export class UpdateUserAccountController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async updateUserAccount(
        userID: number,
        updateAs: string,
        updatedUsername: string,
        updatedPassword: string
    ): Promise<void> {
        return await this.userAccount.updateUserAccount(
            userID,
            updateAs,
            updatedUsername,
            updatedPassword
        )
    }
}

export class SuspendUserAccountController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async suspendUserAccount(userID: number) {
        await this.userAccount.suspendUserAccount(userID)
    }
}

export class SearchUserAccountController {
    private userAccount: UserAccount

    constructor() {
        this.userAccount = new UserAccount()
    }

    public async searchUserAccount(search: string): Promise<UserAccountData[]> {
        return await this.userAccount.searchUserAccounts(search)
    }
}