import { initConsoleLogCollector } from "./console-record/log-collector";
import { registerCommandHandler } from "./content-script/command-handling";

console.log("Harlapse - content", chrome.runtime.getManifest().version)

registerCommandHandler();

initConsoleLogCollector();


