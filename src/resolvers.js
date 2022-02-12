class Resolvers {
    constructor(resolvers) {
        this.timeResolver = resolvers.timeResolver
    }

    getResolvers() {
        return {
            Query: {
                curTime: (parent, args, context, info) => this.timeResolver.curTime(parent, args, context, info),
            },
        }
    }
}

module.exports = {
    Resolvers
}