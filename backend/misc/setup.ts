import { exec, spawn, ExecException } from 'node:child_process'
import { userProfilesTable } from '../src/db/schema/userProfiles'
import { drizzle } from 'drizzle-orm/node-postgres'
import util from 'node:util'
import { Client } from 'pg'
import 'dotenv/config'

const execPromise = util.promisify(exec)

interface ExecResult {
    stdout: string
    stderr: string
}

async function waitForDbReady(
    connectionString: string,
    maxAttempts: number = 15,
    retryIntervalMs: number = 1500
): Promise<boolean> {
    console.log(`\n⏳ Waiting for database to become ready ....`)
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`   Attempt ${attempt}/${maxAttempts}...`)
        const client = new Client({ connectionString })
        try {
            await client.connect()
            await client.query('SELECT 1')
            console.log('✅ Database is ready!')
            await client.end()
            return true
        } catch (error: any) {
            await client.end()
            if (attempt === maxAttempts) {
                console.error(
                    `❌ Database readiness check failed after ${maxAttempts} attempts.`
                )
                console.error('   Error:', error.message || error)
                return false
            }
            await new Promise((resolve) => setTimeout(resolve, retryIntervalMs))
        }
    }
    return false
}

async function runCommand(command: string, cwd?: string): Promise<boolean> {
    const effectiveCwd = cwd || process.cwd()
    console.log(`> ${command}`)
    try {
        const { stdout, stderr }: ExecResult = await execPromise(command, {
            cwd: effectiveCwd
        })
        if (stderr) {
            console.warn(`stderr: ${stderr}`)
        }
        console.log(`stdout:\n${stdout}`)
        console.log(`Command "${command}" executed successfully.`)
        return true
    } catch (error) {
        console.error(`Error executing command "${command}":`)

        const execError = error as ExecException & {
            stdout?: string
            stderr?: string
        }
        if (execError.code !== undefined) {
            console.error(`Exit Code: ${execError.code}`)
        }
        if (execError.message) {
            console.error(`Error Message: ${execError.message}`)
        }
        if (execError.stdout) {
            console.error(`stdout: ${execError.stdout}`)
        }
        if (execError.stderr) {
            console.error(`stderr: ${execError.stderr}`)
        } else if (!execError.code && !execError.message) {
            console.error(error)
        }
        return false
    }
}

async function seedInitialUserProfiles(
    dbInstance: ReturnType<typeof drizzle>
): Promise<boolean> {
    console.log('\n🌱 Seeding initial user profiles...')
    const initialProfiles = [
        { label: 'cleaner' },
        { label: 'homeowner' },
        { label: 'platform manager' },
        { label: 'user admin' }
    ]

    try {
        const result = await dbInstance
            .insert(userProfilesTable)
            .values(initialProfiles)
            .onConflictDoNothing({ target: userProfilesTable.label })
            .returning({ insertedLabel: userProfilesTable.label })

        if (result.length > 0) {
            console.log(
                `   Inserted profiles: ${result.map((r) => r.insertedLabel).join(', ')}`
            )
        } else {
            console.log('   All initial profiles already exist.')
        }

        console.log('✅ Initial user profiles seeded/verified successfully!')
        return true
    } catch (error) {
        console.error('❌ Error seeding initial user profiles:', error)
        return false
    }
}

async function setupDevelopment(): Promise<void> {
    console.log('🚀 Starting development environment setup...')
    const backendDir: string = process.cwd()

    // Initializing database.....
    if (!(await runCommand('docker compose up -d', backendDir))) {
        console.error('🛑 Starting dockerized postgreSQL instance failed. Aborting setup.')
        process.exit(1)
    }
    if (!(await waitForDbReady(process.env.DATABASE_URL!))) {
        console.error('🛑 Database did not become ready. Aborting setup.')
        process.exit(1)
    }
    if (!(await runCommand('npm run db:push', backendDir))) {
        console.error('🛑 Database push failed. Aborting setup.')
        process.exit(1)
    }

    // Initializing TEST database.....
    // process.env.NODE_ENV = 'test'
    // if (!(await runCommand('docker compose -f docker-compose.test.yaml up -d', backendDir))) {
    //     console.error('🛑 Starting dockerized TEST postgreSQL instance failed. Aborting setup.')
    //     process.exit(1)
    // }
    // if (!(await waitForDbReady(process.env.DATABASE_URL!))) {
    //     console.error('🛑 TEST Database did not become ready. Aborting setup.')
    //     process.exit(1)
    // }
    // if (!(await runCommand('npm run db:push:test', backendDir))) {
    //     console.error('🛑 TEST Database push failed. Aborting setup.')
    //     process.exit(1)
    // }
    // process.env.NODE_ENV = ''

    // Seeding the initial 4 user profiles in the default database
    const db = await drizzle(process.env.DATABASE_URL!)
    if (!(await seedInitialUserProfiles(db))) {
        console.warn('⚠️ Seeding failed. Aborting setup. ')
        process.exit(1)
    }

    // Starting dev server
    console.log('\n🚀 Starting the development server (npm run dev)...')
    spawn('npm', ['run', 'dev'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true
    })
}

setupDevelopment()
