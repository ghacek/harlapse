export interface PageBasicInfo {
    title: string,
    url: string
}

export function collectHtml() {
    return new Promise<string>((resolve, reject) => {
        chrome.devtools.inspectedWindow.eval(
            "document.documentElement.outerHTML",
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