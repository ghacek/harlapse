import { Subject } from "rxjs";
import { collectLogEntries } from "../collectors/debugger-console-collector";
import { PageBasicInfo } from "../content-script/command-handlers/types/page-basic-info";
import { CaptureContext } from "./capture-context";
import { Api } from "../api/Api";
import { CreateSnapshotResult } from "../api/data-contracts";

const ApiRoot = "http://localhost:8080/api/";
//const ApiRoot = "http://cutes.io:8081/api/";
const ApiHarUpload = ApiRoot + "snapshot";
const ApiHarView = "http://localhost:4000/view"; //= ApiRoot + "har";
//const ApiHarView = "https://harbin.dev/view";

export function shareState(ctx: CaptureContext, updateStatus: Subject<string>) {

    updateStatus.next("Capturing state...")

    return Promise.all([ctx.collectScreenshot(), ctx.collectNetworkRequests(), ctx.collectBasicInfo(), ctx.collectConsoleLog(), ctx.collectHtml()])
        .then((args) => {
            const ss = args[0];
            const har = args[1];
            const basicInfo = args[2];
            const log = args[3];
            const html = args[4];

            updateStatus.next("Uploading state...");

            return uploadCapture(har, ss, basicInfo, log, html)
                .then((resp) => {
                    chrome.tabs.create({ url: ApiHarView + "/" + resp.ref + "/captured" });
                })
                .then(() => updateStatus.next("Capture finished!"))
                .catch((err) => {
                    updateStatus.error("Upload failed!")
                    console.error(err);
                });
        });
}

function uploadCapture(har: any, screenshot: Blob, basicInfo: PageBasicInfo, log: any[] | undefined, html: string) {
    const data = new FormData();

    const basicInfoStr = JSON.stringify(basicInfo);
    const harStr = JSON.stringify(har);
    const consoleStr = JSON.stringify(log);

    data.append("title", basicInfo.title);
    data.append("url", basicInfo.url);

    return new Api({ baseUrl: "http://localhost:8080/" })
        .createNewSnapshot({
            title: basicInfo.title,
            url: basicInfo.url
        })
        .then(resp => <Promise<CreateSnapshotResult>> resp.json())
        .then(createResult => Promise.all([
            createResult,
            fetch(createResult.uploadBasicInfoLink! , { method: "PUT", body: basicInfoStr, headers: { "Content-Type": "application/json" } }),
            fetch(createResult.uploadScreenshotLink!, { method: "PUT", body: screenshot  , headers: { "Content-Type": "image/png"        } }),
            fetch(createResult.uploadHarLink!       , { method: "PUT", body: harStr      , headers: { "Content-Type": "application/json" } }),
            fetch(createResult.uploadConsoleLink!   , { method: "PUT", body: consoleStr  , headers: { "Content-Type": "application/json" } }),
            fetch(createResult.uploadHtmlLink!      , { method: "PUT", body: html        , headers: { "Content-Type": "text/html"        } })
        ]))
        .then(x => x[0]); 
}

