import { ContentCmdKey, getConsoleLogCmdName, getDocumentHtmlCmdName, getHarFromPerformanceCmdName, getPageBasicInfoCmdName } from "./command-handlers/commands";
import { getConsoleLog } from "./command-handlers/get-console-log";
import { getDocumentHtml } from "./command-handlers/get-document-html";
import { getHarFromPerformance } from "./command-handlers/get-har-from-performance";
import { getPageBasicInfo } from "./command-handlers/get-page-basic-info";

type CmdHandler = (request: object) => any;

type CmdHandlerMap = { [cmd: string]: CmdHandler };

const cmdHandlers: CmdHandlerMap = {
    [getPageBasicInfoCmdName     ]: getPageBasicInfo,
    [getDocumentHtmlCmdName      ]: getDocumentHtml,
    [getHarFromPerformanceCmdName]: getHarFromPerformance,
    [getConsoleLogCmdName        ]: getConsoleLog
};


export function registerCommandHandler() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (sender.id !== chrome.runtime.id) {
            return;
        }

        const cmd = request[ContentCmdKey];
        const handler = cmdHandlers[cmd];

        if (!handler) {
            console.error("CMD handler not found for request ", request);
            return;
        }
        else {
            console.log("CMD handler found for request ", request);
        }

        const result = handler(request);

        if (result instanceof Promise) {
            result.then(sendResponse)
                .catch(console.error);
            return true;
        } 
        else {
            sendResponse(result);
        }
    });
}
