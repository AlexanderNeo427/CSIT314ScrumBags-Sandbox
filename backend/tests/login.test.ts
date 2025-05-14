import { shortlistedServicesTable } from '../src/db/schema/shortlistedServices'
import { serviceCategoriesTable } from '../src/db/schema/serviceCategories'
import { servicesProvidedTable } from '../src/db/schema/servicesProvided'
import { serviceBookingsTable } from '../src/db/schema/serviceBookings'
import { userAccountsTable } from '../src/db/schema/userAccounts'
import { userProfilesTable } from '../src/db/schema/userProfiles'
import { UserAccountData } from '../src/shared/dataClasses'
import { DrizzleClient } from '../src/shared/constants'
import UserAccount from '../src/entities/userAccount'
import { drizzle } from 'drizzle-orm/node-postgres'
import { server } from '../src/index'
import { eq, sql } from 'drizzle-orm'
import { Pool } from 'pg'
import 'dotenv/config'

describe('Login', (): void => {
    let db: DrizzleClient
    let pgPool: Pool

    beforeAll(async (): Promise<void> => {
        pgPool = new Pool({ connectionString: process.env.DATABASE_URL })
        db = drizzle(pgPool)

        try {
            await db
                .insert(userProfilesTable)
                .values([
                    { label: 'cleaner' },
                    { label: 'homeowner' },
                    { label: 'platform manager' },
                    { label: 'homeowner' }
                ])
                .onConflictDoNothing({ target: userProfilesTable.label })
        } catch (err) {
            console.error('Error in beforeAll: ', (err as Error).message)
            throw err
        }
    })

    beforeEach(async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "homeowner", "homeowner"
        )
        if (!createSuccess) {
            throw new Error("Failure to create test account - unable to proceed with tests cases")
        }
    })

    afterEach(async (): Promise<void> => { await db.delete(userAccountsTable) })

    afterAll(async (): Promise<void> => {
        try {
            await db.execute(sql`
                TRUNCATE TABLE 
                ${userProfilesTable}, 
                ${userAccountsTable},
                ${serviceBookingsTable},
                ${servicesProvidedTable},
                ${serviceCategoriesTable},
                ${shortlistedServicesTable}
                RESTART IDENTITY CASCADE;
            `)
        } catch (err) {
            console.error('Error in afterAll: ', (err as Error).message)
        } finally {
            if (pgPool) {
                await pgPool.end()
            }
            server.close()
        }
    })

    it('Login Successfully', async (): Promise<void> => {
        const userAccData = await new UserAccount().login("homeowner", "homeowner")

        expect(userAccData).toBeDefined()
        expect(typeof (userAccData as UserAccountData).id).toBe("number")
        expect((userAccData as UserAccountData).username).toBe("homeowner")
        expect((userAccData as UserAccountData).userProfile).toBe("homeowner")
        expect(typeof (userAccData as UserAccountData).isSuspended).toBe("boolean")
    })

    it('Suspended account', async (): Promise<void> => {
        const db = drizzle(process.env.DATABASE_URL!)

        const TEST_USERNAME = "test homeowner"
        const TEST_PASSWORD = "test password"

        const [homeownerProfile] = await db
            .select({ id: userProfilesTable.id })
            .from(userProfilesTable)
            .where(eq(userProfilesTable.label, "homeowner"))

        // Insert SUSPENDED account
        await db
            .insert(userAccountsTable)
            .values({
                userProfileId: homeownerProfile.id,
                username: TEST_USERNAME,
                password: TEST_PASSWORD,
                isSuspended: true
            })
            .returning()

        const userAccData = await new UserAccount().login(TEST_USERNAME, TEST_PASSWORD)
        expect(userAccData).toBeNull()
    })

    it('Invalid username', async (): Promise<void> => {
        const userAccData = await new UserAccount().login("INVALID VALUE", "homeowner")
        expect(userAccData).toBeNull()
    })

    it('Invalid password', async (): Promise<void> => {
        const userAccData = await new UserAccount().login("homeowner", "INVALID VALUE")
        expect(userAccData).toBeNull()
    })

    it('Invalid username and password', async (): Promise<void> => {
        const userAccData = await new UserAccount().login("INVALID VALUE", "INVALID VALUE")
        expect(userAccData).toBeNull()
    })
})