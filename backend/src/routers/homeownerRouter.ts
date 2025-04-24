import { requireAuthMiddleware } from "../shared/middleware"
import { UserAccountData } from "../shared/dataClasses"
import { StatusCodes } from "http-status-codes"
import {
    ViewAllServiceHistoryController,
    ViewServiceHistoryController,
    AddToShortlistController,
    ViewShortListController
} from "../controllers/homeownerControllers"
import { Router } from "express"
import { CleanerAlreadyShortlistedError } from "../shared/exceptions"

const homeownerRouter = Router()

declare module 'express-session' {
    interface SessionData {
        user: UserAccountData
    }
}

homeownerRouter.post(
    '/shortlist',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        const { cleanerID } = req.body
        try {
            await new AddToShortlistController().addToShortlist(homeownerID, cleanerID)
            res.status(StatusCodes.OK).json({
                message: "Shortlist successful"
            })
        } catch (err: any) {
            if (err instanceof CleanerAlreadyShortlistedError) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: err.message
                })
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: err.message || "Shortlist failed"
                })
            }
        }
    }
)

homeownerRouter.get(
    '/shortlist',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        try {
            const shortlistedCleaners =
                await new ViewShortListController().viewShortlist(homeownerID)
            res.status(StatusCodes.OK).json({
                message: "Shortlist retrieved successfully",
                data: shortlistedCleaners
            })
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message || "Failed to retrieve shortlist"
            })
        }
    }
)

homeownerRouter.get(
    '/servicehistory',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        const { cleanerName, service, date } = req.body
        try {
            const serviceHistory = await new ViewServiceHistoryController()
                .viewServiceHistory(homeownerID, cleanerName, service, date)
            res.status(StatusCodes.OK).json({
                message: "Service history retrieved successfully",
                data: serviceHistory
            })
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message || "Failed to retrieve service history"
            })
        }
    }
)

homeownerRouter.get(
    '/allservicehistory',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        try {
            const serviceHistory =
                await new ViewAllServiceHistoryController()
                    .viewAllServiceHistory(homeownerID)

            res.status(StatusCodes.OK).json({
                message: "Service history retrieved successfully",
                data: serviceHistory
            })
        } catch (error: any) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: error.message || "Failed to retrieve service history"
            })
        }
    }
)

export default homeownerRouter
