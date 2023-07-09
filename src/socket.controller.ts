import cookie from "cookie";
import { Server as HttpServer } from "http";
import { Jwt, VerifyErrors, verify } from "jsonwebtoken";
import { ChangeStreamDocument, ObjectId, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import { Socket as NativeSocket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import BooksController from "./controller/book.controller";
import ResponseHandler from "./controller/response.controller";
import logger from "./helper/utils";
import Book, { IBook } from "./models/book.model";
import { Events, ResponseTypes } from "./sprint.event";
export type SocketQueryData = {
    _id: string;
    name: string;
    photoURL: null | string;
};
export type Socket = NativeSocket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketQueryData
> | null;

export class InitServer {
    #httpServer: HttpServer;
    #isDatabaseConnected: boolean = false;
    #MONGO_URI =
        process.env.MONGO_URI ??
        "mongodb+srv://inevitable:g0JUCfGHzQs0Nell@cluster0.otliyza.mongodb.net/";

    constructor(httpServer: HttpServer) {
        this.#httpServer = httpServer;
        this.initSocketServer = this.initSocketServer.bind(this);
        this.connectDatabase = this.connectDatabase.bind(this);
    }

    async connectDatabase() {
        try {
            await mongoose.set("strictQuery", true);
            await mongoose.connect(
                this.#MONGO_URI,
                {
                    dbName: "lima-db",
                },
                (error) => {
                    if (error?.name.toLowerCase().includes("error")) {
                        throw new Error(error.message);
                    } else {
                        this.#isDatabaseConnected = true;
                    }
                }
            );
            logger.log(
                "database_connect",
                "Successfully connected to database."
            );
        } catch (error: any) {
            logger.log(
                "database_error",
                "message" in error
                    ? error.message
                    : "Something went wrong while connecting to database!"
            );
            logger.log("server_close", "Closing server...");
            return;
        }
    }

    async initSocketServer() {
        const io = new Server(this.#httpServer, {
            pingInterval: 1000,
            pingTimeout: 5000,
            transports: ["websocket"],
            allowUpgrades: false,
        });

        logger.log("socket_initialized");

        const bookWatcher = Book.watch();
        bookWatcher.on(
            "change",
            async (change: ChangeStreamDocument<IBook>) => {
                if (change.operationType === "insert") {
                    return io.sockets.emit(Events.response.SUCCESS, {
                        type: ResponseTypes.BOOK_ADDED,
                        response: change.fullDocument,
                    });
                }

                if (change.operationType === "update") {
                    const books = new BooksController(io.sockets as any);

                    if (
                        (change.updateDescription.updatedFields?.issuedCount ??
                            0) > -1
                    ) {
                        books.latestArrival({ pageNumber: 0 });
                        return books.mostIssued({ pageNumber: 0 });
                    }

                    const book = await Book.findById(
                        change.documentKey._id
                    ).exec();
                    return io.sockets.emit(Events.response.SUCCESS, {
                        type: ResponseTypes.BOOK_UPDATED,
                        response: book,
                    });
                }

                if (change.operationType === "delete") {
                    return io.sockets.emit("successResponse", {
                        type: ResponseTypes.BOOK_REMOVED,
                        response: change.documentKey,
                    });
                }
            }
        );

        io.on("connection", async (socket: NonNullable<Socket>) => {
            const response = new ResponseHandler(socket);
            const { _id = "", name = "" } = socket.handshake
                .query as SocketQueryData;

            console.log(socket.handshake.query);

            if (_id === "" || name === "") {
                response.errorResponse(
                    "Invalid data provided! Please check and try again."
                );
                socket.disconnect(true);
            }

            socket.data = { _id, name };
            socket.join(_id);

            response.successResponse(ResponseTypes.CONNECTED, {
                name: socket.data.name,
                _id: socket.data._id,
            });

            const book = new BooksController(socket);

            socket.on(Events.library.LATEST, book.latestArrival);
            socket.on(Events.library.POPULAR, book.mostIssued);

            socket.on(Events.library.ISSUE, book.issueBook);
            socket.on(Events.library.RETURN, book.returnBook);

            socket.on(Events.library.SEARCH_BOOK, book.searchBooks);
        });

        return io;
    }
}
