import { Router } from "express";
import LibraryController from "../controller/library.controller";

const router = Router();
const libraryRoute = new LibraryController();

const routes = [
    { path: "/add-book", func: libraryRoute.addBook },
    { path: "/delete-book", func: libraryRoute.deleteBook },
];

for (let i = 0; i < routes.length; ++i) {
    router
        .post(routes[i].path, routes[i].func)
        .all(routes[i].path, libraryRoute.route404);
}

export default router;
