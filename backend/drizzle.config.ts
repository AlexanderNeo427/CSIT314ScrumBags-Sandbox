import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'

export default defineConfig({
    out: './drizzle',
    schema: './src/db/schema/*',
    dialect: 'postgresql',
    dbCredentials: {
        url: ((): string => {
            const envPath = process.env.NODE_ENV
                ? `.env.${process.env.NODE_ENV}`
                : '.env'
            dotenv.config({ path: envPath, override: true })
            return process.env.DATABASE_URL!
        })()
    }
})
