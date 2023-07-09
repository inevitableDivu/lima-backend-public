import mongoose, { ObjectId } from "mongoose";

export type IIssuedBooks = {
    bookId: ObjectId;
    studentId: string;
    bookName: string;
    author: string;
};

const issuedSchema = new mongoose.Schema({}, { timestamps: true });
