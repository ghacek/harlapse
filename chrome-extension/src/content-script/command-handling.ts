import { CmdKey, getPageBasicInfoCmdName, getDocumentHtmlCmdName } from "./command-handlers/commands";
import { getDocumentHtml } from "./command-handlers/get-document-html";
import { getPageBasicInfo } from "./command-handlers/get-page-basic-info";

type CmdHandler = (request: object) => any;

type CmdHandlerMap = { [cmd: string]: CmdHandler };

const cmdHandlers: CmdHandlerMap = {
    [getPageBasicInfoCmdName]: getPageBasicInfo,
    [getDocumentHtmlCmdName]: getDocumentHtml
};


export function registerCommandHandler() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (sender.id !== chrome.runtime.id) {
            return;
        }

        const cmd = request[CmdKey];
        const handler = cmdHandlers[cmd];

        if (!handler) {
            console.error("CMD handler not found for request ", request);
            return;
        }

        sendResponse(handler(request));
    });
}


