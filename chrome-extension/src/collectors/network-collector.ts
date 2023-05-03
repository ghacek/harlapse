import { CaptureContext } from "../capture/capture-context";
import { getHarFromPerformanceCmdName } from "../content-script/command-handlers/commands";


const requests: chrome.devtools.network.Request[] = [];

type HarRequest = chrome.devtools.network.Request;

if (chrome.devtools) {

    chrome.devtools.network.onRequestFinished.addListener(request => {
        request.getContent(function(content: string, encoding: string) {

            request.response.content.text = content;
            if (encoding) {
                request.response.content.encoding = encoding;
            }

            requests.push(request);
        })
    });
}

export function collectNetworkRequests1() {
    return new Promise<HARFormatLog>((resolve) => {
        chrome.devtools.network.getHAR((har) => {
            mergeEntryContent(har.entries, requests);

            resolve(har);
        });
    });
}

export function collectNetworkRequests(ctx: CaptureContext) {
    return ctx.sendCmd<any, string>(getHarFromPerformanceCmdName);
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