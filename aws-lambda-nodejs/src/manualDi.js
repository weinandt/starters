const { TimeResolver } = require('./Entities/Time/timeResolver')
const { TimeGateway } = require('./Entities/Time/timeGateway')

class ManualDI {
    static createResolvers() {
        const timeGateway = new TimeGateway()
        const timeResolver = new TimeResolver(timeGateway)

        return {
            timeResolver
        }
    }
}

module.exports = { ManualDI }