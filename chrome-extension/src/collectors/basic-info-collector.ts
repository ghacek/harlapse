import { CaptureContext } from "../capture/capture-context";
import { getPageBasicInfoCmdName } from "../content-script/command-handlers/commands";

export interface PageBasicInfo {
    title: string,
    url: string
}

export function collectBasicInfo(ctx: CaptureContext) {
    return ctx.sendContentCmd<any, PageBasicInfo>(getPageBasicInfoCmdName)
        .then(x => { console.log("basic info", x); return x; });
}