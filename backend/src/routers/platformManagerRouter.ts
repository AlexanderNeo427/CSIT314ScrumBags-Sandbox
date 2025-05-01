import { UserAccountData } from '../shared/dataClasses'
import {
    GenerateWeeklyReportController,
    GenerateDailyReportController,
    GenerateMonthlyReportController
} from '../controllers/platformManagerControllers'
import { StatusCodes } from 'http-status-codes'
import { Router } from 'express'

const platformManagerRouter = Router()

declare module 'express-session' {
    interface SessionData {
        user: UserAccountData
    }
}

platformManagerRouter.post('/daily', async (req, res): Promise<void> => {
    try {
        const { chosenDate } = req.body
        const normalizedDate = new Date(chosenDate)
        normalizedDate.setHours(0, 0, 0, 0)

        const dailyReport =
            await new GenerateDailyReportController()
                .generateDailyReport(normalizedDate)

        res.status(StatusCodes.OK).json(dailyReport)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message,
        });
    }
})

platformManagerRouter.post('/weekly', async (req, res): Promise<void> => {
    try {
        const { chosenDate } = req.body
        const normalizedDate = new Date(chosenDate)
        normalizedDate.setHours(0, 0, 0, 0)

        const weeklyReport =
            await new GenerateWeeklyReportController()
                .generateWeeklyReport(normalizedDate)

        res.status(StatusCodes.OK).json(weeklyReport)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message,
        });
    }
})

platformManagerRouter.post('/monthly', async (req, res): Promise<void> => {
    try {
        const { chosenDate } = req.body
        const normalizedDate = new Date(chosenDate)
        normalizedDate.setHours(0, 0, 0, 0)

        const monthlyReport =
            await new GenerateMonthlyReportController()
                .generateMonthlyReport(normalizedDate)

        res.status(StatusCodes.OK).json(monthlyReport)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message,
        });
    }
})

export default platformManagerRouter
