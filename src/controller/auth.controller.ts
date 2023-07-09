// import { Request, Response } from "express";
// import { z } from "zod";
// import {
//     hashPassword,
//     signUserData,
//     verifyPassword,
// } from "../helper/auth.helper";
// import { validate } from "../helper/validator";
// import User from "../models/user.model";

// const ErrorMaps = {
//     required_error: "Error: Required fields cannot be empty!",
//     invalid_type_error: "Error: Invalid data provided!",
// };

// const RegisterType = z.object({
//     name: z.string(ErrorMaps),
//     email: z.string(ErrorMaps).email("Error: Invalid email provided!"),
//     password: z
//         .string(ErrorMaps)
//         .min(6, "Error: Password must be more than or equal to 6 characters!"),
// });

// export interface IAuthControllerType {
//     login(req: Request, res: Response): Promise<any>;
//     register(req: Request, res: Response): Promise<any>;
//     forgotPassword(req: Request, res: Response): Promise<any>;
//     verifyOtp(req: Request, res: Response): Promise<any>;
//     changePassword(req: Request, res: Response): Promise<any>;
//     route404(req: Request, res: Response): any;
// }

// class AuthController implements IAuthControllerType {
//     route404(req: Request, res: Response): void {
//         res.status(405).json({
//             type: "error",
//             message: `Bad Request! Method ${req.method} not allowed.`,
//         });
//     }

//     async login(req: Request, res: Response) {
//         try {
//             const data = await validate(
//                 req.body,
//                 RegisterType.omit({ name: true })
//             );
//             if (!data.success) throw new Error(data.message);

//             const { email, password } = data.data;
//             const user = await User.findOne({ email }).exec();

//             if (!user) throw new Error("Error: Email not registered!");

//             if (!verifyPassword(password, user.password))
//                 throw new Error("Error: Incorrect Password! Please try again.");

//             const access_token = signUserData(user, { isVerified: true });

//             return res.status(200).json({
//                 type: "success",
//                 response: {
//                     name: user.name,
//                     email: user.email,
//                     access_token,
//                 },
//             });
//         } catch (error: any) {
//             return res.status(405).json({
//                 type: "error",
//                 message:
//                     "message" in error
//                         ? error.message
//                         : "Error: Something went wrong!",
//             });
//         }
//     }
//     async register(req: Request<{}, {}>, res: Response) {
//         try {
//             const data = await validate(req.body, RegisterType);
//             if (!data.success) throw new Error(data.message);

//             const { email, name, password } = data.data;
//             const isUserRegistered = await User.find({ email }).count();

//             if (isUserRegistered)
//                 throw new Error("Error: Email already registered!");

//             const user = await User.create({
//                 email,
//                 name,
//                 password: hashPassword(password),
//                 username: email.split("@")[0],
//             });

//             return res.status(200).json({ type: "success", response: user });
//         } catch (error: any) {
//             return res.status(405).json({
//                 type: "error",
//                 message:
//                     "message" in error
//                         ? error.message
//                         : "Error: Something went wrong!",
//             });
//         }
//     }
//     async forgotPassword(req: Request, res: Response) {
//         const { email } = req.body;
//         const message = "Method not implemented.";
//         return res.status(404).json({ type: "error", message });
//     }
//     async verifyOtp(req: Request, res: Response) {
//         const message = "Method not implemented.";
//         return res.status(404).json({ type: "error", message });
//     }
//     async changePassword(req: Request, res: Response) {
//         const message = "Method not implemented.";
//         return res.status(404).json({ type: "error", message });
//     }
// }

// export default AuthController;
