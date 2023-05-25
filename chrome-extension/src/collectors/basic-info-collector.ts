import { CaptureContext } from "../capture/capture-context";
import { getPageBasicInfoCmdName } from "../content-script/command-handlers/commands";
import { PageBasicInfo } from "../content-script/command-handlers/types/page-basic-info";


export function collectBasicInfo(ctx: CaptureContext) {
    return ctx.sendContentCmd<any, PageBasicInfo>(getPageBasicInfoCmdName)
        .then(x => { return x; });
}