export interface PageBasicInfo {
    title: string,
    url: string
}

export function collectBasicInfo() {
    return new Promise<PageBasicInfo>((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            "({ title: document.title, url: location.href })",
            (result: any) => {
                if (result) {
                    resolve(result);
                } 
                else {
                    reject();
                }
            });
    });
}