import { shortlistedServicesTable } from '../src/db/schema/shortlistedServices'
import { serviceCategoriesTable } from '../src/db/schema/serviceCategories'
import { servicesProvidedTable } from '../src/db/schema/servicesProvided'
import { serviceBookingsTable } from '../src/db/schema/serviceBookings'
import { userAccountsTable } from '../src/db/schema/userAccounts'
import { userProfilesTable } from '../src/db/schema/userProfiles'
import { DrizzleClient } from '../src/shared/constants'
import UserAccount from '../src/entities/userAccount'
import { drizzle } from 'drizzle-orm/node-postgres'
import { server } from '../src/index'
import { sql } from 'drizzle-orm'
import { Pool } from 'pg'
import 'dotenv/config'

describe('Create new user account', (): void => {
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

    it('All valid fields', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "homeowner", "homeowner"
        )
        expect(createSuccess).toBe(true)
    })

    it('Account already exists', async (): Promise<void> => {
        await new UserAccount().createNewUserAccount(
            "homeowner", "homeowner", "homeowner"
        )
        const createDuplicateSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "homeowner", "homeowner"
        )
        expect(createDuplicateSuccess).toBe(false)
    })

    it('Empty profile only', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "", "homeowner", ""
        )
        expect(createSuccess).toBe(false)
    })

    it('Empty username only, ', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "", "homeowner"
        )
        expect(createSuccess).toBe(false)
    })

    it('Empty password only', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "homeowner", ""
        )
        expect(createSuccess).toBe(false)
    })

    it('Empty profile and username', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "", "", "homeowner"
        )
        expect(createSuccess).toBe(false)
    })

    it('Empty profile and password', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "", "homeowner", ""
        )
        expect(createSuccess).toBe(false)
    })

    it('Empty username and password', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "", ""
        )
        expect(createSuccess).toBe(false)
    })

    it('Invalid profile', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "BAZINGA INVALID", "homeowner", ""
        )
        expect(createSuccess).toBe(false)
    })

    it('Whitespace-only username', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", " ", "homeowner"
        )
        expect(createSuccess).toBe(false)
    })

    it('Whitespace-only password', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "homeowner", "     "
        )
        expect(createSuccess).toBe(false)
    })

    it('Whitespace-only username AND password', async (): Promise<void> => {
        const createSuccess = await new UserAccount().createNewUserAccount(
            "homeowner", "     ", "    "
        )
        expect(createSuccess).toBe(false)
    })
})
