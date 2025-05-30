import { LoginController } from '../controllers/sharedControllers'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { UserAccountData } from '../shared/dataClasses'
import {
    CreateNewUserAccountController,
    SuspendUserAccountController,
    UpdateUserAccountController,
    SearchUserAccountController,
    ViewUserAccountsController,
} from '../controllers/userAdminControllers'
import {
    SearchCleanersController,
    ViewCleanersController
} from '../controllers/cleanerControllers'
import { Router } from 'express'

import {
    SearchUserAccountNoResultError,
    UserProfileSuspendedError,
    UserAccountSuspendedError,
    UserAccountNotFoundError,
    InvalidCredentialsError,
} from '../shared/exceptions'

const userAccountsRouter = Router()

/**
 * US-6:  As a user admin, I want to log in so that I can access my admin features
 * 
 * US-19: As a cleaner, I want to log in so that I can manage my services
 * 
 * US-29: As a homeowner, I want to log in so that I can manage my short list
 * 
 * US-41: As a Platform Manager, I want to log in to the 
 *        system so that I can manage platform operations
 */
userAccountsRouter.post('/login', async (req, res): Promise<void> => {
    try {
        const { username, password } = req.body
        const controller = new LoginController()
        const userAccRes = await controller.login(username, password)
        req.session.regenerate(err => {
            if (err) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: 'Express error: ' + err
                })
                return
            }
            (req.session as any).user = userAccRes as UserAccountData
            res.status(StatusCodes.OK).json(userAccRes)
        })
    } catch (err) {
        if (err instanceof UserAccountNotFoundError) {
            res.status(StatusCodes.NOT_FOUND).json({ message: err.message })
        } else if (err instanceof InvalidCredentialsError) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message })
        } else if (
            err instanceof UserAccountSuspendedError ||
            err instanceof UserProfileSuspendedError) {
            res.status(StatusCodes.LOCKED).json({ message: err.message })
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: (err as Error).message
            })
        }
    }
})

/**
 * US-7:  As a user admin, I want to log out so that I can securely end my session 
 * 
 * US-18: As a cleaner, I want to log out so that I can securely end my session
 * 
 * US-30: As a homeowner, I want to log out so that I can securely end my session
 * 
 * US-42: As a Platform Manager, I want to log out of the 
 *        system so that I can securely end my session
 */
userAccountsRouter.post('/logout', async (req, res): Promise<void> => {
    try {
        await req.session.destroy(_ => { })
        res.status(StatusCodes.OK).json({ message: 'Logout successful' })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

/**
 * US-1: As a user admin, I want to create a user 
 *       account so that new users can join the platform
 */
userAccountsRouter.post('/create', async (req, res): Promise<void> => {
    try {
        const { createAs, username, password } = req.body
        const controller = new CreateNewUserAccountController()
        const isCreatedSuccessfully = await controller.createNewUserAccount(
            createAs,
            username,
            password
        )

        if (isCreatedSuccessfully) {
            res.status(StatusCodes.CREATED).json({
                message: 'Account created successfully'
            })
        } else {
            res.status(StatusCodes.CONFLICT).json({
                message: 'Account creation failed'
            })
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
        })
    }
})

/**
 * US-2: As a user admin, I want to view user accounts so that I can see user information
 */
userAccountsRouter.get('/', async (_, res): Promise<void> => {
    const userAccountData = await new ViewUserAccountsController().viewUserAccounts()
    res.status(StatusCodes.OK).json(userAccountData)
})

/**
 * US-24: As a homeowner, I want to search for cleaners so 
 *        that I can find a potential cleaner for my home
 * 
 * US-25: As a homeowner, I want to view cleaners 
 *        so that I can see their services provided
 */
userAccountsRouter.post('/cleaners', async (req, res): Promise<void> => {
    const { cleanerName } = req.body

    //==== US-24 ====
    if (cleanerName && String(cleanerName).length > 0) {
        const searchedCleaners =
            await new SearchCleanersController()
                .searchCleaners(cleanerName)
        res.status(StatusCodes.OK).json(searchedCleaners)
    } else { //======= US-25 ========
        const allCleaners = await new ViewCleanersController().viewCleaners()
        res.status(StatusCodes.OK).json(allCleaners)
    }
})

/**
 * US-3: As a user admin, I want to update user accounts 
 *       so that I can keep user information accurate
 */
userAccountsRouter.post('/update', async (req, res): Promise<void> => {
    const { userId, updatedAs, updatedUsername, updatedPassword } = req.body
    const updateSuccess = await new UpdateUserAccountController().updateUserAccount(
        userId,
        updatedAs,
        updatedUsername,
        updatedPassword
    )
    if (updateSuccess) {
        res.status(StatusCodes.OK).json(true)
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(false)
    }
})

/**
 * US-4: As a user admin, I want to suspend user accounts 
 *       so that I can restrict access when needed
 */
userAccountsRouter.post('/suspend', async (req, res): Promise<void> => {
    const { id } = req.body
    const suspensionSuccess =
        await new SuspendUserAccountController()
            .suspendUserAccount(id)
    if (suspensionSuccess) {
        res.status(StatusCodes.OK).json(true)
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(false)
    }
})

/**
 * TODO: Remove for final submission (??)
 */
userAccountsRouter.post('/unsuspend', async (req, res): Promise<void> => {
    try {
        const { id } = req.body
        await new SuspendUserAccountController().unsuspendUserAccount(id)
        res.status(StatusCodes.OK).json({
            message: "User account of ID '" + id + "' has been unsuspended"
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

/**
 * US-5: As a user admin, I want to search for user 
 *       accounts so that I can locate specific users
 */
userAccountsRouter.get('/search', async (req, res): Promise<void> => {
    const search = req.query.search as string

    const foundUserAccounts: (UserAccountData | null) =
        await new SearchUserAccountController()
            .searchUserAccount(search)

    if (foundUserAccounts !== null) {
        res.status(StatusCodes.OK).json(foundUserAccounts)
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
})

export default userAccountsRouter