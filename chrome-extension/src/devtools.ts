'use strict';
import { Subject } from 'rxjs';

// A DevTools extension adds functionality to the Chrome DevTools.
// For more information on DevTools,
// See https://developer.chrome.com/extensions/devtools

type HarRequest = chrome.devtools.network.Request;

const ApiRoot = "http://localhost:8080/api/";
const ApiHarUpload = ApiRoot + "new-har";
const ApiHarView = "http://localhost:4000/view"; //= ApiRoot + "har";

let panelWindow: any;

/**
 * Requests that were logged by chrome.devtools.network.onRequestFinished 
 * handler, and that have content fetched.
 */
const requests: chrome.devtools.network.Request[] = [];

chrome.devtools.panels.create('Harbin', '', 'panel.html', (panel) => {
    panel.onShown.addListener(window => {
        panelWindow = window;
        initializePanel();
    });
});

chrome.devtools.network.onRequestFinished.addListener(request => {
    request.getContent(function(content: string, encoding: string) {

        request.response.content.text = content;
        if (encoding) {
            request.response.content.encoding = encoding;
        }

        requests.push(request);
    })
});

function initializePanel() {
    if (panelWindow.harbinInitialized) {
        return;
    }

    panelWindow.harbinInitialized = true;

    panelWindow.document.getElementById("share-har")?.addEventListener('click', captureAndShareClick);
    
}

function captureAndShareClick() {
    const updateStatus = new Subject<string>();
    updateStatus.subscribe({
        next : (msg) => displayCaptureState(msg, false),
        error: (msg) => {displayCaptureState(msg, true); console.log("obs error")}
    });

    shareState(updateStatus);
}

function displayCaptureState(status: string, isError: boolean) {
    const el: HTMLDivElement = panelWindow.document.getElementById("capture-state");

    if (isError) {
        el.classList.add("error");
    } 
    else {
        el.classList.remove("error");
    }

    el.style.display = "block";
    el.innerText = status;
}


function shareState(updateStatus: Subject<string>) {

    updateStatus.next("Capturing state...")

    return Promise.all([takeScreenshot(), captureHar(), captureBasicInfo(), captureLogEntries()])
        .then((args) => {
            const ss = args[0];
            const har = args[1];
            const basicInfo = args[2];
            const log = args[3];

            mergeEntryContent(har.entries, requests);

            updateStatus.next("Uploading state...")

            return uploadHar(har, ss, basicInfo, log)
                .then((resp) => resp.json())
                .then((resp) => {
                    chrome.tabs.create({ url: ApiHarView + "?id=" + resp.id });
                })
                .then((resp) => updateStatus.next("Capture finished!"))
                .catch(() => updateStatus.error("Upload failed!"));
        });
}

function uploadHar(har: any, screenshot: Blob, basicInfo: PageBasicInfo, log?: any[]) {
    const data = new FormData();

    const harBlob = new Blob([JSON.stringify(har)], { type: 'application/json' });
    const consoleBlob = new Blob([JSON.stringify(log)], { type: 'application/json' });

    data.append("title", basicInfo.title);
    data.append("url", basicInfo.url);
    data.append("har", harBlob);
    data.append("ss", screenshot);
    data.append("console", consoleBlob);

    return fetch(ApiHarUpload, {
        method: 'POST',
        body: data
    });
}


function captureHar() {
    return new Promise<HARFormatLog>((resolve) => {
        chrome.devtools.network.getHAR((har) => {
            resolve(har);
        });
    });
}


function takeScreenshot() {

    chrome.windows.getLastFocused()
        .then(focusedWin => chrome.tabs.get(chrome.devtools.inspectedWindow.tabId).then(tab => ({focusedWin, tab})))
        .then(x => {
            if (!x.tab.active || x.tab.windowId != x.focusedWin.id) {
                alert("Tab needs to be active to take a screenshot.");
            }
        });

    return chrome.tabs.captureVisibleTab()
        .then(dataUrl => dataURItoBlob(dataUrl));
}

interface PageBasicInfo {
    title: string,
    url: string
}

function captureBasicInfo() {
    return new Promise<PageBasicInfo>((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            "({ title: document.title, url: location.href })",
            (result: any) => {
                if (result) {
                    resolve(result);
                } 
                else {
                    reject();
                }
            });
    });
}

function dataURItoBlob(dataURI: string) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}


function mergeEntryContent(entries: HARFormatEntry[], requests: HarRequest[]) {
    for (const entry of entries) {

        const match = requests.find(request => 
                // Match couple fields to find exact entry match
                   request.startedDateTime === entry.startedDateTime 
                && request.request.url     === entry.request.url
                && request.request.method  === entry.request.method);

        if (match) {
            entry.response.content.text = match.response.content.text;

            const encoding =  match.response.content.encoding;
            if (encoding) {
                entry.response.content.encoding = encoding;
            }
        }
    }
}


let collectedConsoleLogs: any[] | undefined = undefined;

function debuggerConsoleLogCollector(source: any, method: string, params?: Object) {
    //console.log("CL", source, method, params);
    
    if (method !== "Runtime.consoleAPICalled") {
        return;
    }

    collectedConsoleLogs?.push(params);
}

function captureLogEntries() {
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