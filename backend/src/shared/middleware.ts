import { Request, Response, NextFunction } from 'express'
import { UserAccountData } from './dataClasses'
import { StatusCodes } from 'http-status-codes'

declare module 'express-session' {
    interface SessionData {
        user: UserAccountData
    }
}

export const requireAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!(req.session as any).user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Authentication required'
        })
        return
    }
    next()
}

// export const allowedProfilesMiddleware = (allowedRoles: string[]) => {
//     return (req: Request, res: Response, next: NextFunction): void => {
//         console.log("Allowed profiles middleware, user: ", req.session.user)
//
//         if (!(req.session as any).user) {
//             res.status(StatusCodes.UNAUTHORIZED).json({
//                 message: 'Authentication required, the user is',
//                 user: req.session.user
//             })
//             return
//         }
//
//         const user = (req.session as any).user as UserAccountResponse
//         if (!allowedRoles.includes(user.userProfile)) {
//             res.status(StatusCodes.FORBIDDEN).json({
//                 message: 'Insufficient permissions'
//             })
//             return
//         }
//         next()
//     }
// }
