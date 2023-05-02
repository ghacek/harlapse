import { PageBasicInfo } from "../../collectors/basic-info-collector";

export function getPageBasicInfo() : PageBasicInfo {
    return { 
        title: document.title, 
        url: location.href 
    };
}


