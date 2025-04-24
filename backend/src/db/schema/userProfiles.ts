import { serial, pgTable, varchar, uniqueIndex, boolean } from 'drizzle-orm/pg-core'

export const userProfilesTable = pgTable(
    'user_profiles',
    {
        id: serial().primaryKey(),
        label: varchar({ length: 32 }).notNull().unique(),
        isSuspended: boolean().notNull().default(false)
    },
    (table) => [
        uniqueIndex().on(table.label) // No good reason it SHOULDN'T be unique
    ]
)

export type UserProfilesSelect = typeof userProfilesTable.$inferSelect
export type UserProfilesInsert = typeof userProfilesTable.$inferInsert

