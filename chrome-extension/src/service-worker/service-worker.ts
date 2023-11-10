import { initNetworkMonitor } from "../network/monitor";
import { createLokiLogger } from "../util/grafana-loki-logging";
import { registerBgCommandHandler } from "./command-handling";

const logger = createLokiLogger("root");

logger("Harlapse - background", chrome.runtime.getManifest().version);


initNetworkMonitor();
registerBgCommandHandler();

// Making sure that the background script is always running.
// Suspension timeout is delayed by calling chrome API every 20 seconds.
// We need to keep service worker alive to preserve the state of logged network requests.
// https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
// https://developer.chrome.com/docs/extensions/migrating/known-issues/
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();