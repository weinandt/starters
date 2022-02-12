class TimeResolver {
    curTime(first, second, third, fourth) {
        return new Date().toISOString()
    }
}

module.exports = { TimeResolver }