const { AuthError } = require('./Errors/AuthError')

class Context {
    static async createContext() {
        // Here's where you would do auth.
        const isValidUser = true
        if(!isValidUser) {
            throw new AuthError('User Is Not Valid.')
        }

        // Here's where you would hydrate the context to be injected into all the resolvers.
        return {
            userId: 1,
        }
    }
}

module.exports = { Context }