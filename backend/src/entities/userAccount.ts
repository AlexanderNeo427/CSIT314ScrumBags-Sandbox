import { CleanerServicesData, UserAccountData } from '../shared/dataClasses'
import { serviceCategoriesTable } from '../db/schema/serviceCategories'
import { servicesProvidedTable } from '../db/schema/servicesProvided'
import { userProfilesTable } from '../db/schema/userProfiles'
import { userAccountsTable } from '../db/schema/userAccounts'
import { DrizzleClient, GLOBALS } from '../shared/constants'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, ilike } from 'drizzle-orm'
import {
    UserProfileSuspendedError,
    UserAccountSuspendedError,
    UserAccountNotFoundError,
    InvalidCredentialsError,
} from '../shared/exceptions'
import bcrypt from 'bcrypt'

export default class UserAccount {
    private db: DrizzleClient

    constructor() {
        this.db = drizzle(process.env.DATABASE_URL!)
    }

    /**
     * US-6:  As a user admin, I want to log in so that I can access my admin features
     * 
     * US-19: As a cleaner, I want to log in so that I can manage my services
     * 
     * US-29: As a homeowner, I want to log in so that I can manage my short list
     * 
     * US-41: As a Platform Manager, I want to log in to the 
     *        system so that I can manage platform operations
     * 
     * @param password The PLAINTEXT password (not encoded)
     */
    public async login(
        username: string,
        password: string
    ): Promise<UserAccountData | null> {
        try {
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

            if (!retrievedUser) { // User account not found
                return null
            }

            const areCredentialsVerified = await bcrypt.compare(
                password, retrievedUser.password
            )
            if (!areCredentialsVerified) {
                return null
            }
            if (retrievedUser.isSuspended || retrievedUser.profileIsSuspended) {
                return null
            }

            return {
                id: retrievedUser.id,
                username: retrievedUser.username,
                userProfile: retrievedUser.userProfileLabel,
                isSuspended: retrievedUser.isSuspended
            } as UserAccountData
        } catch (err) {
            return null
        }
    }

    /**
     * US-1: As a user admin, I want to create a user 
     *       account so that new users can join the platform
     * 
     * @param password The PLAINTEXT password
     */
    public async createNewUserAccount(
        createAs: string,
        username: string,
        password: string
    ): Promise<boolean> {
        try {
            if (username.trim().length === 0 ||
                password.trim().length === 0) {
                return false
            }

            const [profile] = await this.db
                .select()
                .from(userProfilesTable)
                .where(eq(userProfilesTable.label, createAs))

            if (!profile) {
                return false
            }

            const hashedPassword = await bcrypt.hash(password, GLOBALS.SALT_ROUNDS)
            await this.db.insert(userAccountsTable).values({
                username: username,
                password: hashedPassword,
                userProfileId: profile.id
            })
            return true
        } catch (err) {
            return false
        }
    }

    /**
     * US-2: As a user admin, I want to view user accounts 
     *       so that I can see user information
     */
    public async viewUserAccounts(): Promise<UserAccountData[]> {
        try {
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
        } catch (err) {
            return []
        }
    }

    /**
     * US-25: As a homeowner, I want to view cleaners 
     *        so that I can see their services provided
     * 
     * This async Function only retrieves Cleaner names under the assumption that
     * There will be another page to show the Services provided by the Cleaner.
     * 15042025 2257 Hours
     */
    public async viewCleaners(): Promise<CleanerServicesData[]> {
        try {
            const conditions = [
                eq(userProfilesTable.label, 'cleaner')
            ]

            const queryForCleaners = await this.db
                .select({
                    cleanerID: userAccountsTable.id,
                    cleaner: userAccountsTable.username,
                    serviceName: servicesProvidedTable.serviceName,
                    price: servicesProvidedTable.price,
                    description: servicesProvidedTable.description,
                    serviceID: servicesProvidedTable.id
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
                    service: query.serviceName,
                    price: Number(query.price),
                    description: query.description,
                    serviceProvidedID: query.serviceID
                } as CleanerServicesData
            })
        } catch (err) {
            return []
        }
    }

    /**
     * US-24: As a homeowner, I want to search for cleaners so 
     *        that I can find a potential cleaner for my home
     */
    public async searchCleaners(cleaner: string): Promise<CleanerServicesData[]> {
        try {
            const conditions = [
                eq(userProfilesTable.label, 'cleaner')
            ]
            if (cleaner) {
                conditions.push(eq(userAccountsTable.username, cleaner))
            }

            const queryForCleaners = await this.db
                .select({
                    cleanerID: userAccountsTable.id,
                    cleaner: userAccountsTable.username,
                    serviceCategory: serviceCategoriesTable.label,
                    price: servicesProvidedTable.price,
                    description: servicesProvidedTable.description,
                    serviceID: servicesProvidedTable.id
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
                    price: Number(query.price),
                    description: query.description,
                    serviceProvidedID: query.serviceID
                } as CleanerServicesData
            })
        } catch (err) {
            return []
        }
    }

    /**
     * US-3: As a user admin, I want to update user accounts 
     *       so that I can keep user information accurate
     */
    public async updateUserAccount(
        userID: number,
        updateAs: string,
        updatedUsername: string,
        updatedPassword: string
    ): Promise<boolean> {
        try {
            if (updatedUsername.trim().length === 0 ||
                updatedPassword.trim().length === 0) {
                return false
            }

            const [userProfile] = await this.db
                .select()
                .from(userProfilesTable)
                .where(eq(userProfilesTable.label, updateAs))

            if (!userProfile) {
                return false
            }

            await this.db
                .update(userAccountsTable)
                .set({
                    username: updatedUsername,
                    password: updatedPassword,
                    userProfileId: userProfile.id
                })
                .where(eq(userAccountsTable.id, userID))

            return true
        } catch (err) {
            return false
        }
    }

    /**
     * US-4: As a user admin, I want to suspend user accounts 
     *       so that I can restrict access when needed
     */
    public async suspendUserAccount(userID: number): Promise<boolean> {
        try {
            await this.db
                .update(userAccountsTable)
                .set({ isSuspended: true })
                .where(eq(userAccountsTable.id, userID))
            return true
        } catch (err) {
            return false
        }
    }

    /**
     * TODO: Remove this for submission (??) 
     */
    public async unsuspendUserAccount(userID: number): Promise<void> {
        await this.db
            .update(userAccountsTable)
            .set({ isSuspended: false })
            .where(eq(userAccountsTable.id, userID))
    }

    /**
     * US-5: As a user admin, I want to search for user 
     *       accounts so that I can locate specific users
     */
    public async searchUserAccount(search: string): Promise<UserAccountData | null> {
        try {
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
                return null
            }

            return {
                id: res.id,
                username: res.username,
                userProfile: res.userProfile,
                isSuspended: res.isSuspended
            } as UserAccountData
        } catch (err) {
            return null
        }
    }
}