import { Schema, Types, model, models } from "mongoose";

export type IBook = {
    name: string;
    author: string;
    publishedYear?: number;
    numOfPages: number;
    description?: string;
    genre: string[];
    cover: string;
    blurHash: string;
    isAvailable: boolean;
    issuedCount: number;
    borrower: string | null;
    dueDate: Date | null;
};

export type IBookSchema = IBook & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const bookSchema = new Schema<IBook>(
    {
        name: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
            ref: "authors",
        },
        publishedYear: {
            type: Number,
        },
        numOfPages: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        cover: {
            type: String,
            required: false,
        },
        blurHash: {
            type: String,
            required: false,
        },
        issuedCount: {
            type: Number,
            required: true,
            default: 0,
        },
        isAvailable: {
            type: Boolean,
            required: true,
        },
        borrower: {
            type: String,
            default: null,
        },
        dueDate: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const BookModel = model("book", bookSchema);

const Book: typeof BookModel = models.book || BookModel;

export default Book;
