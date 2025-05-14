import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema/*',
    dialect: 'postgresql',
    strict: true,
    verbose: false,
    dbCredentials: {
        url: ((): string => {
            const envPath = process.env.NODE_ENV
                ? `.env.${process.env.NODE_ENV}`
                : '.env'
            dotenv.config({ path: envPath, override: true })
            console.log("THE DRIZZLE DB CONN: ", process.env.DATABASE_URL!)
            return process.env.DATABASE_URL!
        })()
    }
})
