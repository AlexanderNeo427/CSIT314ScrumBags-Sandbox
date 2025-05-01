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

    public async viewUserProfiles(): Promise<{ name: string, isSuspended: boolean }[]> {
        return await this.userProfile.viewUserProfiles()
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
    public async unsuspendProfile(profileName: string): Promise<void> {
        await this.userProfile.unsuspendUserProfile(profileName)
    }
}

export class SearchUserProfileController {
    private userProfile: UserProfile

    constructor() {
        this.userProfile = new UserProfile()
    }

    public async searchUserProfiles(search: string): Promise<UserProfilesSelect> {
        return await this.userProfile.searchUserProfile(search)
    }
}