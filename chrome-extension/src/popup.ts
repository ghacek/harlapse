
import { Subject } from "rxjs";
import { shareState } from "./capture/capture";
import { TabCaptureContext } from "./capture/tab-capture-context";
import { BgCmdKey, getNetworkLogCmdName } from "./background-script/command-handlers/commands";


const btn = document.getElementById("capture-btn");
const actionBtn = document.getElementById("action-btn");

if (btn) {
    btn.addEventListener('click', () => captureScreenshot());
}

console.log("actionBtn", actionBtn);
actionBtn!.addEventListener('click', execAction);

async function captureScreenshot() {
    const ctx = await TabCaptureContext.getForActiveTab();


    console.log("Capture screenshot")

    const updateStatus = new Subject<any>();
    updateStatus.subscribe(msg => console.log(msg));

    shareState(ctx, updateStatus);
}

function execAction() {
    console.log("execAction()");

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currentTabId = tabs[0].id;

        console.log("extab",  currentTabId);
        chrome.runtime.sendMessage({ [BgCmdKey]: getNetworkLogCmdName });
    });
}