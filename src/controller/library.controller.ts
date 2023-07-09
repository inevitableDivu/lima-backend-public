import { blurhashFromURL } from "blurhash-from-url";
import { Request, Response } from "express";
import Book, { IBook } from "../models/book.model";

export default class LibraryController {
    route404(req: Request, res: Response<any, Record<string, any>>): void {
        res.status(405).json({
            type: "error",
            message: `Bad Request! Method ${req.method} not allowed.`,
        });
    }

    async addBook(req: Request, res: Response) {
        try {
            const {
                name,
                author,
                description,
                publishedYear,
                numOfPages,
                cover,
                genre = [],
            } = req.body as IBook;

            const bluredImageData = await blurhashFromURL(cover, { size: 64 });

            const data: IBook = {
                name,
                author,
                description,
                publishedYear,
                numOfPages,
                cover,
                isAvailable: true,
                blurHash: bluredImageData.encoded,
                issuedCount: 0,
                borrower: null,
                genre,
                dueDate: null,
            };

            const book = await Book.create(data);

            return res
                .status(200)
                .json({ type: "success", response: { book } });
        } catch (error: any) {
            console.log(error.message);
            return res.status(500).json({
                type: "error",
                error: {
                    message: "Error while saving book details in database!",
                },
            });
        }
    }

    async deleteBook(req: Request, res: Response) {
        try {
            const { _id = "" } = req.body as { _id: string };

            if (_id === "")
                return res.status(400).json({
                    type: "error",
                    error: { message: "Invalid Book ID provided!" },
                });

            await Book.findOneAndDelete({ _id }).exec();

            return res.status(200).json({
                type: "success",
                response: "Book deleted successfully!",
            });
        } catch (error: any) {
            return res.status(500).json({
                type: "error",
                error: {
                    message: "Failed to delete the book",
                },
            });
        }
    }
}
