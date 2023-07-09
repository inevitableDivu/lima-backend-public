import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import logger from "./helper/utils";
// import AuthRoute from "./routes/auth.route";
import LibraryRoute from "./routes/library.route";

import { InitServer } from "./socket.controller";

config();
logger.log("app_initialized");

export const app = express();

const PORT = process.env.PORT ?? 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.text());

app.get("/", (_req, res) => {
    res.status(403).json({ statusCode: 403, message: "Error 403: Forbidden!" });
});

app.get("/health-check", (_req, res) => {
    res.status(200).json({ statusCode: 200, message: "Server is running." });
});

// app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/library", LibraryRoute);

export const httpsServer = app.listen(
    process.env.NODE_ENV === "test" ? 8000 : PORT,
    async () => {
        logger.log("server", `Server up and running at PORT: ${PORT}`);
        logger.log("initializing_database");
        await server.connectDatabase();
        logger.log("initializing_socket_controller");
        await server.initSocketServer();
    }
);

const server = new InitServer(httpsServer);

process.addListener("uncaughtException", (error) => {
    logger.log("uncaughtException", error.message);
});
