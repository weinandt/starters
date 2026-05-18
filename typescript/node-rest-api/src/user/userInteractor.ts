import type { CreatedUser, User, UserGateway } from "./userGateway";

export class UserInteractor {
    private userGateway: UserGateway
    constructor(userGateway: UserGateway) {
        this.userGateway = userGateway
    }

    public async getUser(userId: string): Promise<User | null> {
        return this.userGateway.getUser(userId)
    }

    public async createUser(username: string): Promise<CreatedUser> {
        return this.userGateway.createUser(username)
    }
}
