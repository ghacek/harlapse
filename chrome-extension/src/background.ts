'use strict';

import { registerBgCommandHandler } from "./background-script/command-handling";
import { initNetworkMonitor, networkLogAll } from "./network/monitor";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

console.log("Harlapse - background", chrome.runtime.getManifest().version)


initNetworkMonitor();
registerBgCommandHandler();
