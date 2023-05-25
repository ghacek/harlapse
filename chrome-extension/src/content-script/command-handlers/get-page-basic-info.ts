import { PageBasicInfo } from "./types/page-basic-info";


export function getPageBasicInfo() : PageBasicInfo {
    return { 
        title: document.title, 
        url: location.href 
    };
}


