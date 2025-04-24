import { requireAuthMiddleware } from "../shared/middleware"
import { Router } from "express"

const cleanersRouter = Router()

cleanersRouter.get(
    '/services',
    requireAuthMiddleware,
    async (req, res): Promise<void> => {

    }
)

export default cleanersRouter