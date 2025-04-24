import { ViewCleanersController } from '../controllers/cleanerControllers'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { UserAccountData } from '../shared/dataClasses'
import {
    CreateNewUserAccountController,
    UpdateUserAccountController,
    ViewUserAccountsController,
    LoginController,
    SuspendUserAccountController,
    SearchUserAccountController,
} from '../controllers/userAccountControllers'
import { Router } from 'express'
import {
    UserAccountSuspendedError,
    InvalidCredentialsError,
    UserAccountNotFound
} from '../shared/exceptions'

const userAccountsRouter = Router()

userAccountsRouter.get('/', async (req, res): Promise<void> => {
    try {
        const username = typeof req.query.username === 'string'
            ? req.query.username
            : null

        const userAccountData =
            await new ViewUserAccountsController().viewUserAccounts(username)
        res.status(StatusCodes.OK).json(userAccountData)
    } catch (err) {
        if (err instanceof UserAccountNotFound) {
            res.status(StatusCodes.NOT_FOUND).json({ message: err.message })
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: ReasonPhrases.INTERNAL_SERVER_ERROR
            })
        }
    }
})

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

userAccountsRouter.post('/login', async (req, res): Promise<void> => {
    try {
        const { username, password } = req.body
        const controller = new LoginController()
        const userAccRes = await controller.login(username, password)
        req.session.regenerate((err) => {
            if (err) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: 'Express error: ' + err
                })
                return
            }
            ; (req.session as any).user = userAccRes as UserAccountData
            res.status(StatusCodes.OK).json(userAccRes)
        })
    } catch (err) {
        if (err instanceof UserAccountNotFound) {
            res.status(StatusCodes.NOT_FOUND).json({ message: err.message })
        } else if (err instanceof InvalidCredentialsError) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message })
        } else if (err instanceof UserAccountSuspendedError) {
            res.status(StatusCodes.LOCKED).json({ message: err.message })
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: (err as Error).message
            })
        }
    }
})

userAccountsRouter.post('/logout', async (req, res): Promise<void> => {
    try {
        await req.session.destroy((_) => { })
        res.status(StatusCodes.OK).json({ message: 'Logout successful' })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userAccountsRouter.get('/cleaners', async (_, res): Promise<void> => {
    try {
        const allAvailableCleaners =
            await new ViewCleanersController().viewCleaners()
        res.status(StatusCodes.OK).json(allAvailableCleaners)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userAccountsRouter.post('/update', async (req, res): Promise<void> => {
    try {
        const { userId, updatedAs, updatedUsername, updatedPassword } = req.body
        await new UpdateUserAccountController().updateUserAccount(
            userId,
            updatedAs,
            updatedUsername,
            updatedPassword
        )
        res.status(StatusCodes.OK).json({ message: 'Update Success' })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userAccountsRouter.post('/suspend', async (req, res): Promise<void> => {
    try {
        const { id } = req.body
        await new SuspendUserAccountController().suspendUserAccount(id)
        res.status(StatusCodes.OK).json({
            message: "User account of ID '" + id + "' has been suspended"
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userAccountsRouter.get('/search', async (req, res): Promise<void> => {
    try {
        const search = req.query.search as string | undefined
        if (!search) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Search query is required' })
            return
        }
        const foundUserAccounts =
            await new SearchUserAccountController().searchUserAccount(search)
        res.status(StatusCodes.OK).json(foundUserAccounts)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

export default userAccountsRouter