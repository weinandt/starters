import { Book, BookStore } from "./bookStore";

export class BookResolvers {
    private bookStore: BookStore
    constructor(bookStore: BookStore) {
        this.bookStore = bookStore
    }

    saveBook(parent: any, args: any, context: any, info: any): Book {
        // TODO: make this strongly typed.
        const book = args.book as Book
        this.bookStore.saveBook(book)

        return book
    }

    listBooks(parent: any, args: any, context: any, info: any): Book[] {
        return this.bookStore.listBooks()
    }
}