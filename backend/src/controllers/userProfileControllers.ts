import { UserProfilesSelect } from '../db/schema/userProfiles'
import { UserProfile } from '../entities/userProfile'

export class CreateNewUserProfileController {
    private userProfile: UserProfile

    constructor() {
        this.userProfile = new UserProfile()
    }

    public async createNewUserProfile(profileName: string): Promise<boolean> {
        return await this.userProfile.createNewUserProfile(profileName)
    }
}

export class ViewUserProfilesController {
    private userProfile: UserProfile

    constructor() {
        this.userProfile = new UserProfile()
    }

    public async viewUserProfiles(
        profileName: string | null
    ): Promise<string[]> {
        return await this.userProfile.viewUserProfiles(profileName)
    }
}

export class UpdateUserProfileController {
    private userProfile: UserProfile

    constructor() {
        this.userProfile = new UserProfile()
    }

    public async updateUserProfile(
        oldProfileName: string,
        newProfileName: string
    ): Promise<void> {
        return await this.userProfile.updateUserProfile(
            oldProfileName,
            newProfileName
        )
    }
}

export class SuspendUserProfileController {
    private userProfile: UserProfile

    constructor() {
        this.userProfile = new UserProfile()
    }

    public async updateUserProfile(profileName: string): Promise<void> {
        await this.userProfile.suspendUserProfile(profileName)
    }
}

export class SearchUserProfilesController {
    private userProfile: UserProfile

    constructor() {
        this.userProfile = new UserProfile()
    }

    public async searchUserProfiles(search: string): Promise<UserProfilesSelect[]> {
        return await this.userProfile.searchUserProfiles(search)
    }
}