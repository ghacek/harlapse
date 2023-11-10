
import { ContentCmdKey, getConsoleLogCmdName, getDocumentHtmlCmdName, getPageBasicInfoCmdName } from "../content-script/command-handlers/commands";
import { PageBasicInfo } from "../content-script/command-handlers/types/page-basic-info";
import { BgCmdKey, getNetworkLogCmdName } from "../service-worker/command-handlers/commands";


export class CaptureContext {

    constructor(private _tabId: number) {
    }

    get tabId(): number {
        return this._tabId;
    }

    public sendContentMessage<M, R>(message: M): Promise<R> {
        return chrome.tabs.sendMessage<M, R>(this.tabId, message);
    }

    public sendBgMessage<M, R>(message: M): Promise<R> {
        return chrome.runtime.sendMessage<M, R>(message);
    }

    public sendContentCmd<M = any, R = any>(cmd: string, message?: M) : Promise<R> {
        const msg = Object.assign(
            { [ContentCmdKey]: cmd },
            message
        );

        return this.sendContentMessage(msg);
    }
    public sendBgCmd<M = any, R = any>(cmd: string, message?: M) : Promise<R> {
        const msg = Object.assign(
            { [BgCmdKey]: cmd },
            message
        );

        return this.sendBgMessage(msg);
    }

    public collectScreenshot() : Promise<Blob> {
        return chrome.tabs.captureVisibleTab()
            .then(dataUrl => dataURItoBlob(dataUrl));
    }

    public collectBasicInfo() : Promise<PageBasicInfo> {
        return this.sendContentCmd<any, PageBasicInfo>(getPageBasicInfoCmdName);
    }

    public collectHtml() : Promise<string> {
        return this.sendContentCmd<any, string>(getDocumentHtmlCmdName);
    }

    public collectNetworkRequests() {
        return this.sendBgCmd<any, string>(getNetworkLogCmdName, { tabId: this.tabId });
    }

    public collectConsoleLog() : Promise<any> {
        return this.sendContentCmd<any, any>(getConsoleLogCmdName);
    }

    public static async getForActiveTab() {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

        return new CaptureContext(tab.id!);
    }
}

function dataURItoBlob(dataURI: string) {
    return fetch(dataURI).then(res => res.blob());
}



