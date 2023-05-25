import { Subject } from "rxjs";
import { collectLogEntries } from "../collectors/console-collector";
import { CaptureContext } from "./capture-context";
import { PageBasicInfo } from "../content-script/command-handlers/types/page-basic-info";

const ApiRoot = "http://localhost:8080/api/";
//const ApiRoot = "http://cutes.io:8081/api/";
const ApiHarUpload = ApiRoot + "snapshot";
const ApiHarView = "http://localhost:4000/view"; //= ApiRoot + "har";
//const ApiHarView = "https://harbin.dev/view";

export function shareState(ctx: CaptureContext ,updateStatus: Subject<string>) {

    updateStatus.next("Capturing state2...")

    return Promise.all([ctx.collectScreenshot(), ctx.collectNetworkRequests(), ctx.collectBasicInfo(), collectLogEntries(ctx), ctx.collectHtml()])
        .then((args) => {
            const ss = args[0];
            const har = args[1];
            const basicInfo = args[2];
            const log = args[3];
            const html = args[4];

            updateStatus.next("Uploading state...");

            return uploadCapture(har, ss, basicInfo, log, html)
                .then((resp) => resp.json())
                .then((resp) => {
                    chrome.tabs.create({ url: ApiHarView + "/" + resp.id + "/captured" });
                })
                .then((resp) => updateStatus.next("Capture finished!"))
                .catch(() => updateStatus.error("Upload failed!"));
        });
}

function uploadCapture(har: any, screenshot: Blob, basicInfo: PageBasicInfo, log: any[] | undefined, html: string) {
    const data = new FormData();

    const harBlob = new Blob([JSON.stringify(har)], { type: 'application/json' });
    const consoleBlob = new Blob([JSON.stringify(log)], { type: 'application/json' });
    const htmlBlob = new Blob([html], { type: 'text/html' });

    data.append("title", basicInfo.title);
    data.append("url", basicInfo.url);
    data.append("har", harBlob);
    data.append("ss", screenshot);
    data.append("console", consoleBlob);
    data.append("html", htmlBlob);

    return fetch(ApiHarUpload, {
        method: 'POST',
        body: data
    });
}