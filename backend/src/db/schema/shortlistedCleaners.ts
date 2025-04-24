import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { userAccountsTable } from './userAccounts'
import { relations } from 'drizzle-orm'

export const shortlistedCleanersTable = pgTable('shortlisted_cleaners', {
    homeownerID: integer()
        .notNull()
        .references(() => userAccountsTable.id, { onDelete: 'cascade' }),
    cleanerID: integer()
        .notNull()
        .references(() => userAccountsTable.id, { onDelete: 'cascade' })
}, table => [
    primaryKey({ columns: [table.homeownerID, table.cleanerID] })
])

export const shortlistedCleanersRelations = relations(
    shortlistedCleanersTable,
    ({ one }) => ({
        homeowner: one(userAccountsTable, {
            fields: [shortlistedCleanersTable.homeownerID],
            references: [userAccountsTable.id]
        }),
        cleanner: one(userAccountsTable, {
            fields: [shortlistedCleanersTable.cleanerID],
            references: [userAccountsTable.id]
        })
    })
)

export type ShortlistedCleanersInsert = typeof shortlistedCleanersTable.$inferInsert
export type ShortlistedCleanersSelect = typeof shortlistedCleanersTable.$inferSelect