import { TimeGateway } from "./curTime/timeGateway"

export function setUpDepedencies() {
    const timeGateway = new TimeGateway


    return {
        Query: {
            // TODO: add actual types: https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
            curTime: (parent: any, args: any, context: any, info: any) => { return  timeGateway.getCurrentTimeISO() },
        },
    }
}