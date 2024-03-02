import { BookResolvers } from "./book/bookResolver"
import { InMemoryBookStore } from "./book/bookStore"


export function setUpDepedencies() {
    const bookStore = new InMemoryBookStore()
    const bookResolvers = new BookResolvers(bookStore)

    return {
        Query: {
            // TODO: add actual types: https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
            listBooks:(parent: any, args: any, context: any, info: any) => bookResolvers.listBooks(parent, args, context, info),
        },
        Mutation: {
            saveBook: (parent: any, args: any, context: any, info: any) => bookResolvers.saveBook(parent, args, context, info)
        }
    }
}