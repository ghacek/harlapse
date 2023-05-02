import { TabIdBaseCaptureContext } from "./capture-context";

export class TabCaptureContext extends TabIdBaseCaptureContext {

    constructor(private tab: chrome.tabs.Tab) {
        super();
    }


    get tabId(): number {
        return this.tab.id!
    }


    public static async getForActiveTab() {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

        return new TabCaptureContext(tab);
    }
}
