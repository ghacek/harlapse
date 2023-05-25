'use strict';


import { initNetworkMonitor } from "../network/monitor";
import { registerBgCommandHandler } from "./command-handling";


console.log("Harlapse - background", chrome.runtime.getManifest().version)


initNetworkMonitor();
registerBgCommandHandler();
