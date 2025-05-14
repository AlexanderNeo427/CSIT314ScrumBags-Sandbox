import { requireAuthMiddleware } from "../shared/middleware"
import { UserAccountData } from "../shared/dataClasses"
import { StatusCodes } from "http-status-codes"
import {
    ViewAllServiceHistoryController,
    ViewHomeownerServiceHistoryController,
    AddToShortlistController,
    ViewShortlistController,
    SearchShortlistController,
    SearchHomeownerServiceHistoryController,
    CreateServiceBookingController
} from "../controllers/homeownerControllers"
import { Router } from "express"

const homeownerRouter = Router()

declare module 'express-session' {
    interface SessionData {
        user: UserAccountData
    }
}

/**
 * US-26: As a homeowner, I want to save the cleaners into my short list 
 *        so that I can have an easier time for future reference
 */
homeownerRouter.post(
    '/shortlist',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        const { serviceProvidedID } = req.body

        const opSuccess =
            await new AddToShortlistController()
                .addToShortlist(homeownerID, serviceProvidedID)

        if (opSuccess) {
            res.status(StatusCodes.OK).json(true)
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(false)
        }
    }
)

/**
 * US-27: As a homeowner, I want to search through my shortlist so that 
 *        I can find a specific cleaner or service I want
 * 
 * US-28: As a homeowner, I want to view my shortlist so that I 
 *        can have an easy time looking for a cleaner or service
 */
homeownerRouter.get(
    '/shortlist',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        const searchParam = req.query.search

        //===== US-27 ======
        if (searchParam && String(searchParam).length > 0) {
            const searchedShortlistedCleaners =
                await new SearchShortlistController()
                    .searchShortlist(homeownerID, String(searchParam))

            res.status(StatusCodes.OK).json(searchedShortlistedCleaners)
        } else { //====== US-28 =======
            const shortlistedCleaners =
                await new ViewShortlistController()
                    .viewShortlist(homeownerID)

            res.status(StatusCodes.OK).json(shortlistedCleaners)
        }
    }
)

/**
 * US-32: As a homeowner, I want to view the history of the 
 *        cleaner services used, filtered by services, date period 
 *        so that I can keep track of my previous expenses and bookings
 * 
 * US-31: As a homeowner, I want to search the history of the cleaner 
 *        services used, filtered by services, date period so that I 
 *        can easily find past services for reference and rebooking
 */
homeownerRouter.post(
    '/servicehistory',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        const homeownerID = (req.session.user as UserAccountData).id
        const { cleanerName, service, fromDate, toDate } = req.body

        //===== US-31 ======
        if (cleanerName && String(cleanerName).length > 0) {
            const serviceHistory =
                await new SearchHomeownerServiceHistoryController()
                    .searchHomeownerServiceHistory(
                        homeownerID,
                        cleanerName,
                        service,
                        fromDate,
                        toDate
                    )
            res.status(StatusCodes.OK).json(serviceHistory)
        } else { //========== US-32 ==========
            const serviceHistory =
                await new ViewHomeownerServiceHistoryController()
                    .viewHomeownerServiceHistory(homeownerID, service, fromDate, toDate)
            res.status(StatusCodes.OK).json(serviceHistory)
        }
    }
)

/**
 * TODO
 * 
 * Alex | 2025-04-30: "This doesn't seem to be used, can we remove this + controller?"
 */
homeownerRouter.get(
    '/allservicehistory',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {
        try {
            const homeownerID = (req.session.user as UserAccountData).id

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
