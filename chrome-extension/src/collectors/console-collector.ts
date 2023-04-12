let collectedConsoleLogs: any[] | undefined = undefined;

function debuggerConsoleLogCollector(source: any, method: string, params?: Object) {
    //console.log("CL", source, method, params);
    
    if (method !== "Runtime.consoleAPICalled") {
        return;
    }

    collectedConsoleLogs?.push(params);
}

export function captureLogEntries() {
    return new Promise<any[] | undefined>((resolve, reject) => {
        // TODO handle failure
        collectedConsoleLogs = [];
        const target = { tabId: chrome.devtools.inspectedWindow.tabId };

        chrome.debugger.onEvent.addListener(debuggerConsoleLogCollector);
        chrome.debugger.attach(target, "1.0", function() {
            chrome.debugger.sendCommand(target, "Runtime.enable", function() {
                chrome.debugger.onEvent.removeListener(debuggerConsoleLogCollector);
                chrome.debugger.detach(target);

                const logItems = collectedConsoleLogs;

                collectedConsoleLogs = undefined;

                resolve(logItems);
            });
        });
    });
}