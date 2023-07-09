import Book, { IBook } from "../models/book.model";
import User from "../models/user.model";
import { Socket } from "../socket.controller";
import { ResponseTypes } from "../sprint.event";
import ResponseHandler from "./response.controller";

const LIMIT = 16;
const RETURN_DAY = 7;
const DUE_DATE = RETURN_DAY * 24 * 3600 * 1000;

const NUM_OF_BOOKS_ISSUE_LIMIT = 7;
const LIMIT_FINE_AMOUNT = 100;

export default class BooksController {
    #socket: Socket;
    response: ResponseHandler;

    constructor(socket: Socket) {
        this.#socket = socket;
        this.response = new ResponseHandler(socket);
        this.latestArrival = this.latestArrival.bind(this);
        this.mostIssued = this.mostIssued.bind(this);
        this.checkStudentId = this.checkStudentId.bind(this);
        this.returnBook = this.returnBook.bind(this);
        this.issueBook = this.issueBook.bind(this);
        this.searchBooks = this.searchBooks.bind(this);
    }

    async checkStudentId() {
        try {
            const { _id, name } = this.#socket?.data!;
            const student = await User.findOne({ studentId: _id }).exec();

            if (student)
                return {
                    canAvailBooks:
                        !student.isBlackListed &&
                        student.fineAmount < LIMIT_FINE_AMOUNT &&
                        student.numOfBooksIssued < NUM_OF_BOOKS_ISSUE_LIMIT,
                    data: student,
                };

            const createdStudent = await User.create({
                name,
                studentId: _id,
            });
            return {
                canAvailBooks: true,
                data: createdStudent,
            };
        } catch (error: any) {
            return {
                canAvailBooks: false,
                data: null,
            };
        }
    }

    async latestArrival(data: any = {}) {
        try {
            const { pageNumber = 0 } = data;
            if (typeof pageNumber !== "number")
                return this.response.errorResponse("Invalid data provided!");

            if (pageNumber < 0)
                return this.response.errorResponse("No more data found!");

            const books = await Book.aggregate([
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
                {
                    $skip: pageNumber * LIMIT,
                },
                {
                    $limit: LIMIT,
                },
            ]);

            return this.response.successResponse(
                ResponseTypes.LATEST_ARRIVALS,
                books
            );
        } catch (error: any) {
            return this.response.errorResponse(
                error.message ?? "Something went wrong"
            );
        }
    }

    async mostIssued(data: any = {}) {
        try {
            const { pageNumber = 0 } = data;
            if (typeof pageNumber !== "number")
                return this.response.errorResponse("Invalid data provided!");

            if (pageNumber < 0)
                return this.response.errorResponse("No more data found!");

            const books = await Book.aggregate([
                {
                    $sort: {
                        issuedCount: -1,
                    },
                },
                {
                    $skip: pageNumber * LIMIT,
                },
                {
                    $limit: LIMIT,
                },
            ]);

            return this.response.successResponse(
                ResponseTypes.MOST_ISSUED,
                books
            );
        } catch (error: any) {
            return this.response.errorResponse(
                error.message ?? "Something went wrong"
            );
        }
    }

    async issueBook(
        { bookId = "" },
        callback: (params: { status: "ok" | "error" }) => any = () => {}
    ) {
        try {
            if (typeof bookId !== "string" || bookId.trim() === "")
                return this.response.errorResponse("Invalid data provided!");

            const response = await this.checkStudentId();

            if (!response.canAvailBooks)
                throw new Error("Book cannot be issued!");

            const book = await Book.findOne({ _id: bookId }).exec();

            if (!book) throw new Error("Something went wrong!");

            if (!book.isAvailable)
                throw new Error("Book not available at the moment!");

            const borrower = this.#socket?.data._id!;
            const dueDate = new Date(Date.now() + DUE_DATE);
            const isAvailable = !Boolean(borrower);
            const newBook = await Book.findOneAndUpdate(
                { _id: bookId },
                {
                    $set: {
                        borrower,
                        isAvailable,
                        dueDate,
                    },
                    $inc: {
                        issuedCount: 1,
                    },
                },
                {
                    new: true,
                }
            );

            await User.findOneAndUpdate(
                { studentId: this.#socket?.data._id! },
                {
                    $set: {
                        numOfBooksIssued:
                            (response.data?.numOfBooksIssued ?? 0) + 1,
                    },
                }
            );

            callback({ status: "ok" });
            return this.response.successResponse(
                ResponseTypes.BOOK_ISSUED,
                newBook
            );
        } catch (error: any) {
            callback({ status: "error" });
            this.response.errorResponse(
                error.message ?? "Something went wrong!"
            );
        }
    }

    async returnBook(
        { bookId = "" },
        callback: (params: {
            status: "ok" | "error";
            fineAmount: number;
        }) => any = () => {}
    ) {
        try {
            if (typeof bookId !== "string" || bookId.trim() === "")
                return this.response.errorResponse("Invalid data provided!");

            const book = await Book.findOneAndUpdate(
                {
                    _id: bookId,
                    borrower: this.#socket?.data._id!,
                },
                {
                    $set: {
                        borrower: null,
                        dueDate: null,
                        isAvailable: true,
                    },
                }
            );

            if (!book) throw new Error("Something went wrong!");

            const timeDuration =
                new Date().getTime() - new Date(book.dueDate!).getTime();

            console.log({ timeDuration, dueData: book.dueDate });
            const fine =
                timeDuration <= 0
                    ? 0
                    : Math.floor(timeDuration / (1000 * 24 * 3600)) * 5;

            const user = await User.findOneAndUpdate(
                { studentId: this.#socket?.data._id! },
                { $inc: { numOfBooksIssued: -1, fineAmount: fine } },
                {
                    new: true,
                }
            );

            const bookData = ("_doc" in book ? book._doc : book) as IBook;

            callback({ status: "ok", fineAmount: user?.fineAmount ?? 0 });
            return this.response.successResponse(ResponseTypes.BOOK_RETURNED, {
                book: {
                    ...bookData,
                    isAvailable: true,
                    borrower: null,
                    dueDate: null,
                },
                fineAmount: user?.fineAmount ?? 0,
            });
        } catch (error: any) {
            callback({ status: "error", fineAmount: 0 });
            return this.response.errorResponse(
                error.message ?? "Something went wrong!"
            );
        }
    }

    async searchBooks(
        data: { pageNumber: number; search: string },
        callback: <T>(params: {
            status: "ok" | "error";
            response: T;
        }) => any = () => {}
    ) {
        try {
            const { pageNumber = 0, search = "" } = data;

            const bookList =
                ((await Book.aggregate([
                    {
                        $search: {
                            compound: {
                                should: [
                                    {
                                        autocomplete: {
                                            query: search,
                                            path: "name",
                                        },
                                    },
                                    {
                                        autocomplete: {
                                            query: search,
                                            path: "author",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $skip: LIMIT * pageNumber,
                    },
                    {
                        $limit: LIMIT,
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            author: 1,
                            publishedYear: 1,
                            numOfPages: 1,
                            description: 1,
                            genre: 1,
                            cover: 1,
                            blurHash: 1,
                            isAvailable: 1,
                            issuedCount: 1,
                            borrower: 1,
                            dueDate: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ]).exec()) as IBook[]) ?? [];

            console.log(bookList);

            callback({ status: "ok", response: bookList });

            return this.response.successResponse(
                ResponseTypes.SEARCH_RESULT,
                bookList
            );
        } catch (error: any) {
            callback({ status: "error", response: [] });
            return this.response.errorResponse(
                error.message ?? "Something went wrong!"
            );
        }
    }
}
