import { BgCmdKey, getNetworkLogCmdName } from "./command-handlers/commands";
import { getNetworkLogCmd } from "./command-handlers/get-network-log";


type CmdHandler = (request: object) => any;

type CmdHandlerMap = { [cmd: string]: CmdHandler };

const cmdHandlers: CmdHandlerMap = {
    [getNetworkLogCmdName]: getNetworkLogCmd,
};


export function registerBgCommandHandler() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension-4");

        if (sender.id !== chrome.runtime.id) {
            return;
        }

        const cmd = request[BgCmdKey];
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


