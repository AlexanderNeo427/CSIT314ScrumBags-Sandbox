import { userProfilesTable } from './userProfiles'
import { relations } from 'drizzle-orm'
import {
    uniqueIndex,
    boolean,
    pgTable,
    varchar,
    integer,
    serial,
} from 'drizzle-orm/pg-core'

export const userAccountsTable = pgTable(
    'user_accounts',
    {
        id: serial().primaryKey(),
        username: varchar({ length: 32 }).notNull().unique(),
        password: varchar({ length: 128 }).notNull(),
        userProfileId: integer()
            .notNull()
            .references(() => userProfilesTable.id, { onDelete: 'cascade' }),
        isSuspended: boolean().notNull().default(false)
    },
    table => [uniqueIndex().on(table.username)]
)

export const userAccountsRelations = relations(
    userAccountsTable,
    ({ one }) => ({
        userProfile: one(userProfilesTable, {
            fields: [userAccountsTable.userProfileId],
            references: [userProfilesTable.id]
        })
    })
)

export type UserAccountsSelect = typeof userAccountsTable.$inferSelect
export type UserAccountsInsert = typeof userAccountsTable.$inferInsert

