import { ObjectId, Schema, model, models } from "mongoose";

export type IAuthorTypes = {
    _id: ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

const userSchema = new Schema<IAuthorTypes>({}, { timestamps: true });

const UserModel = model("author", userSchema);

const User: typeof UserModel = models.author || UserModel;

export default User;
