import { TabIdBaseCaptureContext } from "./capture-context";

export class DevToolsCaptureContext extends TabIdBaseCaptureContext {


    get tabId(): number {
        return chrome.devtools.inspectedWindow.tabId;
    }

    override collectScreenshot(): Promise<Blob> {
        // From devtools screenshot can be captured only when devtools are docked
        return chrome.windows.getLastFocused()
              .then(focusedWin => chrome.tabs.get(chrome.devtools.inspectedWindow.tabId).then(tab => ({focusedWin, tab})))
              .then(x => {
                  if (!x.tab.active || x.tab.windowId != x.focusedWin.id) {
                      alert("Tab needs to be active to take a screenshot.");
                      throw "Tab needs to be active to take a screenshot.";
                  }
              })
              .then(() => super.collectScreenshot());
    }

}