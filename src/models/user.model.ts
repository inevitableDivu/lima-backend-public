import { ObjectId, Schema, model, models } from "mongoose";

export type IUserTypes = {
    name: string;
    studentId: string;
    isBlackListed: boolean;
    fineAmount: number;
    numOfBooksIssued: number;
};

export type IUser = {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const userSchema = new Schema<IUserTypes>(
    {
        studentId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        isBlackListed: {
            type: Boolean,
            default: false,
        },
        fineAmount: {
            type: Number,
            default: 0,
        },
        numOfBooksIssued: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const UserModel = model("user", userSchema);

const User: typeof UserModel = models.user || UserModel;

export default User;
