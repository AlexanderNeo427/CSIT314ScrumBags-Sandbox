import {
    CreateNewUserProfileController,
    SearchUserProfileController,
    SuspendUserProfileController,
    UpdateUserProfileController,
    ViewUserProfilesController
} from '../controllers/userProfileControllers'
import { StatusCodes } from 'http-status-codes'
import { Router } from 'express'

const userProfilesRouter = Router()

/**
 * Create user profile
 */
userProfilesRouter.post('/', async (req, res): Promise<void> => {
    try {
        const { profileName } = req.body
        const profileCreated =
            await new CreateNewUserProfileController().createNewUserProfile(profileName)
        if (!profileCreated) {
            throw new Error("Unable to create profile '" + profileName + "'")
        }
        res.status(StatusCodes.CREATED).json({ message: 'Success' })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userProfilesRouter.get('/', async (_, res): Promise<void> => {
    try {
        const profiles =
            await new ViewUserProfilesController().viewUserProfiles()
        res.status(StatusCodes.OK).json(profiles)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userProfilesRouter.put('/update', async (req, res): Promise<void> => {
    try {
        const { oldProfileName, newProfileName } = req.body
        await new UpdateUserProfileController().updateUserProfile(
            oldProfileName,
            newProfileName
        )
        res.status(StatusCodes.OK).json({ message: 'Update Success' })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userProfilesRouter.post('/suspend', async (req, res): Promise<void> => {
    try {
        const { profileName } = req.body
        await new SuspendUserProfileController().updateUserProfile(profileName)
        res.status(StatusCodes.OK).json({ message: 'UserProfile suspended' })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

userProfilesRouter.post('/unsuspend', async (req, res): Promise<void> => {
    try {
        const { profileName } = req.body;
        await new SuspendUserProfileController().unsuspendProfile(profileName);
        res.status(StatusCodes.OK).json({ message: 'UserProfile unsuspended' });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        });
    }
});

userProfilesRouter.get('/search', async (req, res): Promise<void> => {
    try {
        const search = req.query.search as string | undefined
        if (!search) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Search query is required' })
            return
        }
        const data = await new SearchUserProfileController().searchUserProfiles(search)
        res.status(StatusCodes.OK).json(data)
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: (err as Error).message
        })
    }
})

export default userProfilesRouter
