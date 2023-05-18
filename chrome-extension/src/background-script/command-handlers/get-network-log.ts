import { getHarForTabId } from "../../network/monitor";


export function getNetworkLogCmd(request: any) {
    const tabId: number = request.tabId;
    if (!tabId || tabId <= 0) {
        return;
    }

    return getHarForTabId(tabId);
}