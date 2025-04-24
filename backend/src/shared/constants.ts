import { drizzle } from 'drizzle-orm/node-postgres'

export const GLOBALS = {
    SALT_ROUNDS: 9
}

export type DrizzleClient = ReturnType<typeof drizzle>
