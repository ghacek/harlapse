import { ContentCmdKey, getPageBasicInfoCmdName, getDocumentHtmlCmdName, getHarFromPerformanceCmdName } from "./command-handlers/commands";
import { getDocumentHtml } from "./command-handlers/get-document-html";
import { getPageBasicInfo } from "./command-handlers/get-page-basic-info";
import { getHarFromPerformance } from "./command-handlers/get-har-from-performance";

type CmdHandler = (request: object) => any;

type CmdHandlerMap = { [cmd: string]: CmdHandler };

const cmdHandlers: CmdHandlerMap = {
    [getPageBasicInfoCmdName     ]: getPageBasicInfo,
    [getDocumentHtmlCmdName      ]: getDocumentHtml,
    [getHarFromPerformanceCmdName]: getHarFromPerformance
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

        sendResponse(handler(request));
    });
}


