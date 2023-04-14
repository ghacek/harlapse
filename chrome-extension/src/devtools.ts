import { Subject } from 'rxjs';
import { collectScreenshot } from './collectors/screenshot-collector'
import { collectNetworkRequests } from './collectors/network-collector';
import { captureLogEntries as collectLogEntries } from './collectors/console-collector';
import { PageBasicInfo, collectBasicInfo } from './collectors/basic-info-collector';



const ApiRoot = "http://localhost:8080/api/";
//const ApiRoot = "http://cutes.io:8081/api/";
const ApiHarUpload = ApiRoot + "new-har";
const ApiHarView = "http://localhost:4000/view"; //= ApiRoot + "har";
//const ApiHarView = "https://harbin.dev/view";



let panelWindow: any;

/**
 * Requests that were logged by chrome.devtools.network.onRequestFinished 
 * handler, and that have content fetched.
 */


chrome.devtools.panels.create('Harbin', '', 'panel.html', (panel) => {
    panel.onShown.addListener(window => {
        panelWindow = window;
        initializePanel();
    });
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
        error: (msg) => displayCaptureState(msg, true)
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

    return Promise.all([collectScreenshot(), collectNetworkRequests(), collectBasicInfo(), collectLogEntries()])
        .then((args) => {
            const ss = args[0];
            const har = args[1];
            const basicInfo = args[2];
            const log = args[3];

            updateStatus.next("Uploading state...")

            return uploadCapture(har, ss, basicInfo, log)
                .then((resp) => resp.json())
                .then((resp) => {
                    chrome.tabs.create({ url: ApiHarView + "/" + resp.id + "/captured" });
                })
                .then((resp) => updateStatus.next("Capture finished!"))
                .catch(() => updateStatus.error("Upload failed!"));
        });
}

function uploadCapture(har: any, screenshot: Blob, basicInfo: PageBasicInfo, log?: any[]) {
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


