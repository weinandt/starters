import { InMemoryBookStore } from "./book/timeGateway"


export function setUpDepedencies() {
    const bookStore = new InMemoryBookStore()


    return {
        Query: {
            // TODO: add actual types: https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
            listBooks: (parent: any, args: any, context: any, info: any) => { return  bookStore.listBooks() },
        },
    }
}