const { TimeResolver } = require('./curTime')

class ManualDI {
    static createResolvers() {
        const timeResolver = new TimeResolver()

        return {
            timeResolver
        }
    }
}

module.exports = { ManualDI }