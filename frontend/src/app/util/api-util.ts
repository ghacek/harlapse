import { environment } from "src/environments/environment"



export function apiScreenshotUrl(ref: string) {
    return environment.apiRootUrl + "/api/screenshot?ref=" + ref;
}