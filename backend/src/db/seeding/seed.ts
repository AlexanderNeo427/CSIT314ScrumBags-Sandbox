//==================================================================================
const NO_OF_HOMEOWNERS = 20
const NO_OF_CLEANERS = 20
const NO_OF_PLATFORM_MANAGERS = 4
const NO_OF_USER_ADMINS = 6

// Ranges from 0-1. The chance of generating a 'suspended' user account
const HOMEOWNER_SUSPENSION_CHANCE = 0.18
const CLEANER_SUSPENSION_CHANCE = 0.1
//==================================================================================
import { presetServiceCategories, presetServiceNames } from './sensibleDefaults'
import { createUserAccount, generateUserAccounts } from './userAccountHelpers'
import { clearTheDatabase, initShortlistEntries } from './shared'
import { userProfilesTable } from '../schema/userProfiles'
import { DrizzleClient } from '../../shared/constants'
import { drizzle } from 'drizzle-orm/node-postgres'
import {
    initServiceCategories,
    initServicesProvided,
    initServiceBookings
} from './serviceHelpers'
import { Pool } from 'pg'
import 'dotenv/config'

const driver = async (db: DrizzleClient): Promise<void> => {
    await clearTheDatabase(db)

    // ---- Insert default profiles
    await db.insert(userProfilesTable).values([
        { label: 'homeowner' },
        { label: 'cleaner' },
        { label: 'platform manager' },
        { label: 'user admin' }
    ]).onConflictDoNothing()

    // ----- Generate a bunch of random user accounts
    const allHomeowners = [
        await createUserAccount(db, "homeowner", "homeowner", "homeowner"),
        ...await generateUserAccounts(
            db,
            NO_OF_HOMEOWNERS,
            'homeowner',
            HOMEOWNER_SUSPENSION_CHANCE
        )
    ]
    const allCleaners = [
        await createUserAccount(db, "cleaner", "cleaner", "cleaner"),
        ...await generateUserAccounts(
            db,
            NO_OF_CLEANERS,
            'cleaner',
            CLEANER_SUSPENSION_CHANCE
        )
    ]

    await createUserAccount(db, "platform manager", "platform manager", "platform manager")
    await generateUserAccounts(db, NO_OF_PLATFORM_MANAGERS, 'platform manager')

    await createUserAccount(db, "user admin", "user admin", "user admin")
    await generateUserAccounts(db, NO_OF_USER_ADMINS, 'user admin')

    const serviceCategories = await initServiceCategories(db, presetServiceCategories)
    const servicesProvided = await initServicesProvided(
        db,
        allCleaners,
        serviceCategories,
        presetServiceNames
    )
    await initServiceBookings(db, allHomeowners, servicesProvided)
    await initShortlistEntries(db, allHomeowners, allCleaners)
    console.log("Successfully seeded the database!")
}

const main = async (): Promise<void> => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
    try {
        const db = drizzle(pool)
        await driver(db)
    } catch (err) {
        console.error('Error with seeding the database: ', (err as Error).message)
    } finally {
        await pool.end()
    }
}
main()

