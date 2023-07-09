// import { Router } from "express";
// import AuthController from "../controller/auth.controller";

// const router = Router();
// const authRoute = new AuthController();

// const routes = [
//     { path: "/login", func: authRoute.login },
//     { path: "/register", func: authRoute.register },
//     { path: "/forgot-password", func: authRoute.forgotPassword },
//     { path: "/forgot-password/verify-otp", func: authRoute.verifyOtp },
//     {
//         path: "/forgot-password/change-password",
//         func: authRoute.changePassword,
//     },
// ];

// for (let i = 0; i < routes.length; ++i) {
//     router
//         .post(routes[i].path, routes[i].func)
//         .all(routes[i].path, authRoute.route404);
// }

// export default router;
