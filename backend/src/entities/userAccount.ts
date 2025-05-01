import { CleanerServicesData, UserAccountData } from '../shared/dataClasses'
import { shortlistedCleanersTable } from '../db/schema/shortlistedCleaners'
import { serviceCategoriesTable } from '../db/schema/serviceCategories'
import { servicesProvidedTable } from '../db/schema/servicesProvided'
import { userProfilesTable } from '../db/schema/userProfiles'
import { userAccountsTable } from '../db/schema/userAccounts'
import { DrizzleClient } from '../shared/constants'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, ilike } from 'drizzle-orm'
import {
    CleanerAlreadyShortlistedError,
    UserAccountSuspendedError,
    UserAccountNotFoundError,
    InvalidCredentialsError,
    UserProfileSuspendedError
} from '../shared/exceptions'
import bcrypt from 'bcrypt'

export default class UserAccount {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    /**
     * Create new user account
     * @param password The ENCODED password
     */
    public async createNewUserAccount(
        createAs: string,
        username: string,
        password: string
    ): Promise<boolean> {
        const [userProfile] = await this.db
            .select()
            .from(userProfilesTable)
            .where(eq(userProfilesTable.label, createAs))

        if (!userProfile) {
            return false
        }

        await this.db.insert(userAccountsTable).values({
            username: username,
            password: password,
            userProfileId: userProfile.id
        })
        return true
    }

    /**
     * Login user account
     * @param password The PLAINTEXT password (not encoded)
     */
    public async login(
        username: string,
        password: string
    ): Promise<UserAccountData> {
        const [retrievedUser] = await this.db
            .select({
                id: userAccountsTable.id,
                username: userAccountsTable.username,
                password: userAccountsTable.password,
                isSuspended: userAccountsTable.isSuspended,
                userProfileLabel: userProfilesTable.label,
                profileIsSuspended: userProfilesTable.isSuspended
            })
            .from(userAccountsTable)
            .leftJoin(
                userProfilesTable,
                eq(userAccountsTable.userProfileId, userProfilesTable.id)
            )
            .where(eq(userAccountsTable.username, username))
            .limit(1)

        if (!retrievedUser) {
            throw new UserAccountNotFoundError(
                "Couldn't find user of username: " + username
            )
        }

        const areCredentialsVerified = await bcrypt.compare(
            password,
            retrievedUser.password
        )
        if (!areCredentialsVerified) {
            throw new InvalidCredentialsError(
                'Invalid credentials entered for user of username: ' + username
            )
        }

        if (retrievedUser.isSuspended) {
            throw new UserAccountSuspendedError(
                'User account ' + retrievedUser.username + ' is suspended'
            )
        }

        if (retrievedUser.profileIsSuspended) {
            throw new UserProfileSuspendedError(
                'User profile ' + retrievedUser.userProfileLabel + ' is suspended'
            )
        }

        return {
            id: retrievedUser.id,
            username: retrievedUser.username,
            userProfile: retrievedUser.userProfileLabel
        } as UserAccountData
    }

    /**
     * View all user accounts
     */
    public async viewUserAccounts(): Promise<UserAccountData[]> {
        const query = await this.db
            .select({
                id: userAccountsTable.id,
                username: userAccountsTable.username,
                profileLabel: userProfilesTable.label,
                isSuspended: userAccountsTable.isSuspended
            })
            .from(userAccountsTable)
            .leftJoin(
                userProfilesTable,
                eq(userAccountsTable.userProfileId, userProfilesTable.id)
            )

        return query.map(u => {
            return {
                id: u.id,
                username: u.username,
                userProfile: u.profileLabel,
                isSuspended: u.isSuspended
            } as UserAccountData
        })
    }

    // This async Function only retrieves Cleaner names under the assumption that
    // There will be another page to show the Services provided by the Cleaner.
    // 15042025 2257 Hours
    public async viewCleaners(
        cleanerName: string | null
    ): Promise<CleanerServicesData[]> {
        const conditions = [
            eq(userProfilesTable.label, 'cleaner')
        ]

        if (cleanerName) {
            conditions.push(eq(userAccountsTable.username, cleanerName))
        }

        const queryForCleaners = await this.db
            .select({
                cleanerID: userAccountsTable.id,
                cleaner: userAccountsTable.username,
                serviceCategory: serviceCategoriesTable.label,
                price: servicesProvidedTable.price
            })
            .from(servicesProvidedTable)
            .innerJoin(serviceCategoriesTable, eq(
                servicesProvidedTable.serviceCategoryID,
                serviceCategoriesTable.id
            ))
            .innerJoin(userAccountsTable, eq(
                servicesProvidedTable.cleanerID,
                userAccountsTable.id
            ))
            .innerJoin(userProfilesTable, eq(
                userAccountsTable.userProfileId,
                userProfilesTable.id
            ))
            .where(and(...conditions))

        return queryForCleaners.map(query => {
            return {
                cleanerID: query.cleanerID,
                cleaner: query.cleaner,
                service: query.serviceCategory,
                price: Number(query.price)
            } as CleanerServicesData
        })
    }

    /**
     * Add to shortlist
     */
    public async addToShortlist(homeownerID: number, cleanerID: number): Promise<void> {
        const result = await this.db
            .select()
            .from(shortlistedCleanersTable)
            .where(and(
                eq(shortlistedCleanersTable.homeownerID, homeownerID),
                eq(shortlistedCleanersTable.cleanerID, cleanerID)
            ))
        if (result.length > 0) {
            throw new CleanerAlreadyShortlistedError(
                "Already shortlisted cleaner of ID " + cleanerID
            )
        }

        await this.db
            .insert(shortlistedCleanersTable)
            .values({ homeownerID, cleanerID })
    }

    public async viewShortlist(
        homeownerID: number

    ): Promise<string[]> {
        const shortlistedCleaners = await this.db
            .select({ cleanerID: shortlistedCleanersTable.cleanerID })
            .from(shortlistedCleanersTable)
            .where(eq(shortlistedCleanersTable.homeownerID, homeownerID))

        // Retrieve cleaner names based on the cleanerIDs from shortlistedCleaners
        const cleanerNames = await Promise.all(shortlistedCleaners.map(async (entry) => {
            const [cleaner] = await this.db
                .select({ cleanerName: userAccountsTable.username })
                .from(userAccountsTable)
                .where(eq(userAccountsTable.id, entry.cleanerID))

            return cleaner?.cleanerName || "Unknown Cleaner"
        }));

        return cleanerNames
    }

    public async searchShortlist(
        homeownerID: number,
        search: string
    ): Promise<string[]> {
        const shortlistedCleaners = await this.db
            .select({ cleanerName: userAccountsTable.username })
            .from(shortlistedCleanersTable)
            .leftJoin(servicesProvidedTable, eq(
                shortlistedCleanersTable.cleanerID,
                servicesProvidedTable.cleanerID
            ))
            .leftJoin(userAccountsTable, eq(
                shortlistedCleanersTable.cleanerID,
                userAccountsTable.id
            ))
            .where(and(
                eq(shortlistedCleanersTable.homeownerID, homeownerID),
                ilike(userAccountsTable.username, `%${search}%`),
            ))
            .groupBy(userAccountsTable.username)

        return shortlistedCleaners.map(cl => cl.cleanerName || "Unknown Cleaner")
    }

    /**
     * Update user account
     */
    public async updateUserAccount(
        userID: number,
        updateAs: string,
        updatedUsername: string,
        updatedPassword: string
    ): Promise<void> {
        const [userProfile] = await this.db
            .select()
            .from(userProfilesTable)
            .where(eq(userProfilesTable.label, updateAs))

        await this.db
            .update(userAccountsTable)
            .set({
                username: updatedUsername,
                password: updatedPassword,
                userProfileId: userProfile.id
            })
            .where(eq(userAccountsTable.id, userID))
    }

    /**
     * Suspend user account
     */
    public async suspendUserAccount(userID: number): Promise<void> {
        await this.db
            .update(userAccountsTable)
            .set({ isSuspended: true })
            .where(eq(userAccountsTable.id, userID))
    }

    public async unsuspendUserAccount(userID: number): Promise<void> {
        await this.db
            .update(userAccountsTable)
            .set({ isSuspended: false })
            .where(eq(userAccountsTable.id, userID))
    }

    /**
     * Search user accounts
     */
    public async searchUserAccount(search: string): Promise<UserAccountData> {
        const [res] = await this.db
            .select({
                id: userAccountsTable.id,
                username: userAccountsTable.username,
                userProfile: userProfilesTable.label,
                isSuspended: userAccountsTable.isSuspended
            })
            .from(userAccountsTable)
            .leftJoin(userProfilesTable, eq(
                userAccountsTable.userProfileId,
                userProfilesTable.id
            ))
            .where(ilike(userAccountsTable.username, `%${search}%`))
            .limit(1)

        if (!res) {
            throw new UserAccountNotFoundError("This user account doesn't exist")
        }

        return {
            id: res.id,
            username: res.username,
            userProfile: res.userProfile,
            isSuspended: res.isSuspended
        } as UserAccountData
    }
}