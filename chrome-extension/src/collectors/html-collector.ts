import { CaptureContext } from "../capture/capture-context";
import { getDocumentHtmlCmdName } from "../content-script/command-handlers/commands";

export function collectHtml(ctx: CaptureContext) {
    return ctx.sendCmd<any, string>(getDocumentHtmlCmdName);
}