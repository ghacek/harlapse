import { Subject } from 'rxjs';
import { shareState } from './capture/capture';
import { DevToolsCaptureContext } from './capture/devtools-capture-context';

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

    const ctx = new DevToolsCaptureContext();

    shareState(ctx, updateStatus);
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



