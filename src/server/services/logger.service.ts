/* eslint-disable no-console */
import pc from "picocolors";

export class Logger {
    private static isProd = process.env.NODE_ENV === "production";

    private static formatMessage(level: string, message: string, context?: Record<string, unknown>) {
        if (this.isProd) {
            return JSON.stringify({ level, message, ...context, timestamp: new Date().toISOString() });
        }

        const timestamp = pc.gray(new Date().toLocaleTimeString());
        let levelTag = `[${level.toUpperCase()}]`;

        switch (level) {
            case "info": levelTag = pc.blue(levelTag); break;
            case "error": levelTag = pc.red(levelTag); break;
            case "warn": levelTag = pc.yellow(levelTag); break;
            case "debug": levelTag = pc.magenta(levelTag); break;
            default: break;
        }

        const contextStr = (context && Object.keys(context).length > 0) ? ` ${pc.gray(JSON.stringify(context))}` : "";
        return `${timestamp} ${levelTag} ${message}${contextStr}`;
    }

    static info(message: string, context?: Record<string, unknown>) {
        console.log(this.formatMessage("info", message, context));
    }

    static error(message: string, context?: Record<string, unknown>) {
        console.error(this.formatMessage("error", message, context));
    }

    static warn(message: string, context?: Record<string, unknown>) {
        console.warn(this.formatMessage("warn", message, context));
    }

    static debug(message: string, context?: Record<string, unknown>) {
        if (!this.isProd) {
            console.debug(this.formatMessage("debug", message, context));
        }
    }
}
