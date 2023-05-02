
import { Subject } from "rxjs";
import { shareState } from "./capture/capture";
import { TabCaptureContext } from "./capture/tab-capture-context";



const btn = document.getElementById("capture-btn");

if (btn) {
    btn.addEventListener('click', () => captureScreenshot());
}

async function captureScreenshot() {
    const ctx = await TabCaptureContext.getForActiveTab();

    shareState(ctx, new Subject<any>());
}

