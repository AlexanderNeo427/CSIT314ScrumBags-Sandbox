import { GenerateReportController as GenerateDailyReportController } from '../controllers/platformManagerController'
import { UserAccountData } from '../shared/dataClasses'
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
        const { chosenDate } = req.body;
        const myDate = new Date(Date.parse(chosenDate));
        const dailyReport =
            await new GenerateDailyReportController().generateDailyReport(myDate);
        res.status(StatusCodes.OK).json(dailyReport);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message,
        });
    }
})

// platformManagerRouter.post('/weekly', async (req, res): Promise<void> => {
//     try {
//         const { chosenDate } = req.body;
//         const myDate = new Date(Date.parse(chosenDate));
//         const dailyReport =
//             await new GenerateDailyReportController().generateDailyReport(myDate);
//         res.status(StatusCodes.OK).json(dailyReport);
//     } catch (err) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message: (err as Error).message,
//         });
//     }
// })

// platformManagerRouter.post('/monthly', async (req, res): Promise<void> => {
//     try {
//         const { chosenDate } = req.body;
//         const myDate = new Date(Date.parse(chosenDate));
//         const dailyReport =
//             await new GenerateDailyReportController().generateDailyReport(myDate);
//         res.status(StatusCodes.OK).json(dailyReport);
//     } catch (err) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message: (err as Error).message,
//         });
//     }
// })

export default platformManagerRouter
