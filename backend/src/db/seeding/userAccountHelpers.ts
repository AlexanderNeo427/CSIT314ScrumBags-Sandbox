import { DrizzleClient, GLOBALS } from "../../shared/constants"
import { createProfileIdMappings } from "./shared"
import { faker } from "@faker-js/faker"
import {
    UserAccountsInsert,
    UserAccountsSelect,
    userAccountsTable
} from "../schema/userAccounts"
import bcrypt from 'bcrypt'

export const createUserAccount = async (
    db: DrizzleClient,
    username: string,
    password: string,
    profile: string
): Promise<UserAccountsSelect> => {

    const [userAcc] = await db
        .insert(userAccountsTable)
        .values({
            username: username,
            password: await bcrypt.hash(password, GLOBALS.SALT_ROUNDS),
            userProfileId: (await createProfileIdMappings(db)).get(profile) as number,
        })
        .onConflictDoNothing()
        .returning()
    return userAcc
}

export const generateUserAccounts = async (
    db: DrizzleClient,
    count: number,
    userProfile: string,
    suspendChance: number = 0
): Promise<UserAccountsSelect[]> => {

    const profileMappings = await createProfileIdMappings(db)
    const userProfileID = profileMappings.get(userProfile) as number

    const accountsToInsert: UserAccountsInsert[] = []
    for (let i = 0; i < count; i++) {
        const userAndPass = faker.internet.username()
        accountsToInsert.push({
            username: userAndPass,
            password: await bcrypt.hash(userAndPass, GLOBALS.SALT_ROUNDS),
            userProfileId: userProfileID,
            isSuspended: faker.number.float({ min: 0, max: 1 }) < suspendChance
        })
    }
    return await db
        .insert(userAccountsTable)
        .values(accountsToInsert)
        .onConflictDoNothing()
        .returning()
}

