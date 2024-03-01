export class TimeGateway {
    getCurrentTimeISO(): string {
        return new Date().toISOString()
    }
}

