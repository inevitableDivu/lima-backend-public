export const Events = {
    response: {
        SUCCESS: "successResponse",
        ERROR: "errorInfo",
        NOTIFICATION: "notification",
        USER_SUGGESTION: "getUserSuggestion",
    },

    library: {
        ADD_BOOK: "addBook",
        DELETE_BOOK: "deleteBook",
        ADD_AUTHOR: "addAuthor",
        LATEST: "latestBooks",
        POPULAR: "popularBooks",
        ISSUE: "issueBook",
        RETURN: "returnBook",
        FINE_REMINDER: "fineReminder",
        GET_BOOK: "getBookDetail",

        SEARCH_BOOK: "searchBook",
    },

    student: {
        EXPIRED: "issueExpired",
        CHANGE_USERNAME: "changeUsername",
        CHECK_USERNAME: "checkUsernameValidity",
    },
};

export enum ResponseTypes {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    USER_SUGGESTION_LIST = "users_suggestion_list",

    LATEST_ARRIVALS = "latest_arrivals",
    MOST_ISSUED = "most_issued_books",

    BOOK_ADDED = "book_added",
    BOOK_REMOVED = "book_removed",
    BOOK_UPDATED = "book_updated",

    BOOK_ISSUED = "book_issued",
    ISSUE_EXPIRED = "book_issue_period_expired",
    BOOK_RETURNED = "book_returned",

    BOOKMARK_ADDED = "bookmark_added",
    BOOKMARK_REMOVED = "bookmark_removed",

    SEARCH_RESULT = "search_book_result",
}
