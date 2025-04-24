import { pgTable, integer, text, numeric, varchar, serial } from 'drizzle-orm/pg-core'
import { serviceCategoriesTable } from './serviceCategories'
import { userAccountsTable } from './userAccounts'
import { relations } from 'drizzle-orm'

export const servicesProvidedTable = pgTable('services_provided', {
    id: serial().primaryKey(),
    cleanerID: integer()
        .notNull()
        .references(() => userAccountsTable.id, { onDelete: 'cascade' }),
    serviceCategoryID: integer()
        .notNull()
        .references(() => serviceCategoriesTable.id, { onDelete: 'cascade' }),
    serviceName: varchar({ length: 64 }).notNull(),
    description: text(),
    price: numeric().notNull()
})

export const servicesProvidedRelations = relations(
    servicesProvidedTable,
    ({ one }) => ({
        cleaner: one(userAccountsTable, {
            fields: [servicesProvidedTable.cleanerID],
            references: [userAccountsTable.id]
        }),
        serviceCategory: one(serviceCategoriesTable, {
            fields: [servicesProvidedTable.serviceCategoryID],
            references: [serviceCategoriesTable.id]
        })
    })
)

export type ServicesProvidedInsert = typeof servicesProvidedTable.$inferInsert
export type ServicesProvidedSelect = typeof servicesProvidedTable.$inferSelect