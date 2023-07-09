const formatter = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

class Logger {
    log(name = "", ...args: any) {
        console.log(
            `${formatter.format(new Date())} [${name.toUpperCase()}]${
                args.length === 0 ? "" : ": "
            }`,
            ...args
        );
    }
}

const logger = new Logger();

export default logger;
