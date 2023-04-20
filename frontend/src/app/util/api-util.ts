import { SnapshotControllerService } from "src/api/services";
import { environment } from "src/environments/environment"



export function apiScreenshotUrl(ref: string) {
    return environment.apiRootUrl 
        + SnapshotControllerService.GetSnapshotScreenshotPath.replace("{ref}", ref);
}

export function apiAnnotationConfigUrl(ref: string) {
    return environment.apiRootUrl 
        + SnapshotControllerService.GetSnapshotAnnotationsConfigPath.replace("{ref}", ref);
}

export function apiAnnotationSvgUrl(ref: string) {
    return environment.apiRootUrl 
        + SnapshotControllerService.GetSnapshotAnnotationsSvgPath.replace("{ref}", ref);
}