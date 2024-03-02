import { BookResolvers } from "./book/bookResolver"
import { InMemoryBookStore } from "./book/bookStore"
import { GraphQLResolveInfo } from 'graphql';


export function setUpDepedencies() {
    const bookStore = new InMemoryBookStore()
    const bookResolvers = new BookResolvers(bookStore)

    return {
        Query: {
           listBooks:(parent: any, args: any, context: any, info: GraphQLResolveInfo) => bookResolvers.listBooks(parent, args, context, info),
        },
        Mutation: {
            saveBook: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => bookResolvers.saveBook(parent, args, context, info)
        }
    }
}