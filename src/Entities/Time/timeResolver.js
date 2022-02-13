class TimeResolver {
    constructor(timeGateway) {
        this.timeGateway = timeGateway
    }

    async curTime(_, context, args, info) {
        const curTime = await this.timeGateway.getTime()

        return curTime
    }
}

module.exports = { TimeResolver }