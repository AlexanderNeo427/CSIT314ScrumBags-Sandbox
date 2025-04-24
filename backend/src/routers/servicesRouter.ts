import { requireAuthMiddleware } from '../shared/middleware'
import { UserAccountData } from '../shared/dataClasses'
import { StatusCodes } from 'http-status-codes'
import {
    CreateServiceCategoryController,
    CreateServiceProvidedController,
    ViewServiceCategoriesController,
    ViewServicesProvidedController
} from '../controllers/serviceControllers'
import { Router } from 'express'
import {
    ServiceCategoryNotFoundError,
    ServiceAlreadyProvidedError
} from '../shared/exceptions'

const servicesRouter = Router()

declare module 'express-session' {
    interface SessionData {
        user: UserAccountData
    }
}

/**
 * Create new service 'categories'
 */
servicesRouter.post('/categories', async (req, res): Promise<void> => {
    try {
        const { category } = req.body
        await new CreateServiceCategoryController().createServiceCategory(category)
        res.status(StatusCodes.OK).send()
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

/**
 * View all service 'categories' that exist
 */
servicesRouter.get('/categories', async (_, res): Promise<void> => {
    try {
        const allServiceCategories =
            await new ViewServiceCategoriesController()
                .viewServiceCategories()
        res.status(StatusCodes.OK).json(allServiceCategories)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

/**
 * Gets all the service 'types' provided by a cleaner (by their userID)
 */
servicesRouter.get('/:id', async (req, res): Promise<void> => {
    try {
        const { id } = req.params
        const servicesProvided =
            await new ViewServicesProvidedController()
                .viewServicesProvided(Number(id))

        res.status(StatusCodes.OK).json(servicesProvided)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

/**
 * Cleaners can add the types of services they provide
 */
servicesRouter.post(
    '/me',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        try {
            if (!req.session.user) {
                /**
                 * Shouldn't reach here, as the 'requireAuthMiddleware'
                 * should ensure the user object is valid
                 *
                 * Just asserting that it isn't null to stop the
                 * Typescript compiler from complaining (zzzzz)
                 */
                throw new Error("This isn't (theoretically) possible")
            }

            const { service, category, description, price } = req.body
            await new CreateServiceProvidedController().createServiceProvided(
                req.session.user?.id,
                service,
                category,
                description,
                Number(price)
            )
            res.status(StatusCodes.CREATED).send()
        } catch (err) {
            if (err instanceof ServiceAlreadyProvidedError) {
                res.status(StatusCodes.CONFLICT).json({
                    message: (err as Error).message
                })
            } else if (err instanceof ServiceCategoryNotFoundError) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: (err as Error).message
                })
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: (err as Error).message
                })
            }
        }
    }
)

// servicesRouter.get('/history', )

export default servicesRouter
