// Here is where you would put code to call a database.
class TimeGateway {
    async getTime() {
        return new Date().toISOString()
    }
}

module.exports = { TimeGateway }