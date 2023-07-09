import { Socket } from "../socket.controller";
import { Events, ResponseTypes } from "../sprint.event";

class ResponseHandler {
    protected _socket: Socket | undefined;

    constructor(socket: Socket) {
        this._socket = socket;
        this.errorResponse = this.errorResponse.bind(this);
        this.successResponse = this.successResponse.bind(this);
    }

    public errorResponse(message?: string) {
        message =
            message && message.includes("buffering timed")
                ? "Internal server error. Please try again later."
                : message;
        return this._socket?.emit(Events.response.ERROR, {
            type: "error",
            message: message ?? "Something went wrong. Please try again later.",
        });
    }

    public successResponse<T>(
        type: ResponseTypes,
        data?: T,
        message?: string
    ): boolean | undefined;
    public successResponse<T>(
        type: ResponseTypes,
        data: T,
        target: string[],
        message?: string
    ): boolean | undefined;
    public successResponse<T>(
        type: ResponseTypes,
        data?: T,
        target?: string | string[],
        message?: string
    ): boolean | undefined {
        if (!data)
            return this._socket?.emit(Events.response.SUCCESS, {
                type,
                message: target ?? "Success",
            });

        const response =
            typeof data === "object" && "_doc" in data ? data._doc : data;

        if (typeof target === "string") {
            return this._socket?.emit(Events.response.SUCCESS, {
                type,
                response,
                message: target,
            });
        }
        if (typeof target === "object" && Array.isArray(target)) {
            if (target.length === 0)
                return this._socket?.emit(Events.response.SUCCESS, {
                    type,
                    response,
                    message: message ?? "Success",
                });

            const hasOwnId = (target ?? []).find(
                (item) => item === this._socket?.data._id
            );
            let newTargets = (target ?? []).filter((item) =>
                item === this._socket?.data._id ? null : item
            );

            console.log({
                hasOwnId,
                newTargets,
                currentId: this._socket?.data._id,
                target,
            });
            if (newTargets.length === 0)
                return this._socket?.emit(Events.response.SUCCESS, {
                    type,
                    response,
                    message: message ?? "Success",
                });

            if (newTargets.length >= 1 && hasOwnId) {
                this._socket?.emit(Events.response.SUCCESS, {
                    type,
                    response,
                    message: message ?? "Success",
                });
                return this._socket?.to(target).emit(Events.response.SUCCESS, {
                    type,
                    response,
                    message: message ?? "Success",
                });
            }
            if (newTargets.length >= 1)
                return this._socket?.to(target).emit(Events.response.SUCCESS, {
                    type,
                    response,
                    message: message ?? "Success",
                });

            return this._socket?.emit(Events.response.SUCCESS, {
                type,
                response,
                message: message ?? "Success",
            });
        }

        // if (!target)
        return this._socket?.emit(Events.response.SUCCESS, {
            type,
            response,
            message: target ?? message ?? "Success",
        });
    }
}

export default ResponseHandler;
