import { serviceCategoriesOfferedTable } from '../src/db/schema/serviceCategoriesOffered'
import { CreateNewUserAccountController } from '../src/controllers/userControllers'
import { shortlistedCleanersTable } from '../src/db/schema/shortlistedCleaners'
import { serviceCategoriesTable } from '../src/db/schema/serviceCategories'
import { serviceBookingsTable } from '../src/db/schema/serviceBookings'
import { userAccountsTable } from '../src/db/schema/userAccounts'
import { userProfilesTable } from '../src/db/schema/userProfiles'
import { drizzle } from 'drizzle-orm/node-postgres'
import { GLOBALS } from '../src/shared/constants'
import { StatusCodes } from 'http-status-codes'
import { app, server } from '../src/index'
import { eq, sql } from 'drizzle-orm'
import supertest from 'supertest'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { Pool } from 'pg'

describe('Testing the Login Endpoint', (): void => {
    let db: ReturnType<typeof drizzle>
    let pgPool: Pool

    beforeAll(async (): Promise<void> => {
        const envPath = process.env.NODE_ENV
            ? `.env.${process.env.NODE_ENV}` : '.env'
        dotenv.config({ path: envPath, override: true })

        pgPool = new Pool({
            connectionString: process.env.DATABASE_URL
        })
        db = drizzle(pgPool)

        try {
            await db
                .insert(userProfilesTable)
                .values([
                    { label: 'cleaner' },
                    { label: 'homeowner' },
                    { label: 'platform manager' },
                    { label: 'user admin' }
                ])
                .onConflictDoNothing({ target: userProfilesTable.label })
        } catch (err) {
            console.error('Error in beforeAll: ', (err as Error).message)
            throw err
        }
    })

    afterEach(async (): Promise<void> => {
        await db.delete(userAccountsTable)
    })

    afterAll(async (): Promise<void> => {
        try {
            await db.execute(sql`
                TRUNCATE TABLE 
                ${userProfilesTable}, 
                ${userAccountsTable},
                ${serviceBookingsTable},
                ${serviceCategoriesTable},
                ${serviceCategoriesOfferedTable},
                ${shortlistedCleanersTable}
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

    it('POST /api/user-accounts/login ---> Returns 200 OK', async () => {
        const testUsername = 'test user'
        const testPassword = 'test password'
        const testProfile = 'cleaner'

        await new CreateNewUserAccountController()
            .createNewUserAccount(testProfile, testUsername, testPassword)

        const response = await supertest(app)
            .post('/api/user-accounts/login')
            .send({ username: testUsername, password: testPassword })

        expect(response.status).toBe(StatusCodes.OK)

        expect(response.body).toHaveProperty('id')
        expect(typeof response.body.id).toBe('string')
        expect(response.body.id.length).toBeGreaterThan(0)

        expect(response.body).toHaveProperty('username')
        expect(typeof response.body.username).toBe('string')
        expect(response.body.username.length).toBeGreaterThan(0)

        expect(response.body).toHaveProperty('userProfile')
        expect(typeof response.body.userProfile).toBe('string')
        expect(response.body.userProfile).toBe('cleaner')
        expect(response.body.userProfile.length).toBeGreaterThan(0)
    })

    it('POST /api/user-accounts/login ---> Returns 404 NOT FOUND', async () => {
        const response = await supertest(app)
            .post('/api/user-accounts/login')
            .send({ username: 'A non-existent user', password: '' })

        expect(response.status).toBe(StatusCodes.NOT_FOUND)
        expect(response.body).toEqual({})
    })

    it('POST /api/user-accounts/login ---> Returns 500 INTERNAL SERVER ERROR', async () => {
        const response = await supertest(app)
            .post('/api/user-accounts/login')

        expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    })

    it('POST /api/user-accounts/login ---> Returns 401 UNAUTHORIZED', async () => {
        const testUsername = 'test user'
        const testPassword = 'test password'
        const testProfile = 'cleaner'

        await new CreateNewUserAccountController()
            .createNewUserAccount(testProfile, testUsername, testPassword)

        const response = await supertest(app)
            .post('/api/user-accounts/login')
            .send({ username: testUsername, password: 'VERY WRONG PASSWORD' })

        expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    it('POST /api/user-accounts/login ---> Returns 423 LOCKED', async () => {
        const testUsername = 'test user'
        const testPassword = 'test password'
        const testProfile = 'cleaner'

        const [profileEntry] = await db
            .select().from(userProfilesTable)
            .where(eq(userProfilesTable.label, testProfile))

        await db.insert(userAccountsTable).values({
            username: testUsername,
            password: await bcrypt.hash(testPassword, GLOBALS.SALT_ROUNDS),
            userProfileId: profileEntry.id,
            isSuspended: true
        })

        const response = await supertest(app)
            .post('/api/user-accounts/login')
            .send({ username: testUsername, password: testPassword })

        expect(response.status).toBe(StatusCodes.LOCKED)
    })
})
