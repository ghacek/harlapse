import { registerCommandHandler } from "./content-script/command-handling";

console.log("Harlapse - content", chrome.runtime.getManifest().version)

registerCommandHandler();



