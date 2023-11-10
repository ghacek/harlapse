import { getLogEntries } from "../../console-record/log-collector";
import { LogData } from "../../console-record/log-observer";


export function getConsoleLog() : LogData[] {
    return getLogEntries();
}