import { LogData, initLogObserver } from "./log-observer";

const logEntries: LogData[] = [];

let isInitialized = false;

export function initConsoleLogCollector() {
    if (isInitialized) {
        return;
    }

    initLogObserver(
        entry => logEntries.push(entry), 
        window, 
        {}
    );

    isInitialized = true;
    // TODO limit the size of recorder log entries
}


export function getLogEntries() : LogData[] {
    return logEntries;
}