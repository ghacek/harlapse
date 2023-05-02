import { CmdKey } from "../content-script/command-handlers/commands";



export interface CaptureContext {
    
    get tabId(): number;

    /** Executes script in the context of the page that is being captured. */
    eval<T>(script: string) : Promise<T>;

    /** Sends a message to the content script */
    sendMessage<M = any, R = any>(message: M) : Promise<R>;

    /** Sends a command to the content script */
    sendCmd<M = any, R = any>(cmd: string, message?: M) : Promise<R>;

    collectScreenshot() : Promise<Blob>;
}

export abstract class TabIdBaseCaptureContext implements CaptureContext {

    abstract get tabId(): number;

    public eval<T>(script: string): Promise<T> {
        return <any>chrome.scripting.executeScript({
            target: {
                tabId: this.tabId!
            },
            func: (code) => {
                return eval(code);
            },
            args: [script]
        }).then(x => {
            console.log("executeScript", x);
            return x;
        });
    }

    public sendMessage<M, R>(message: M): Promise<R> {
        return chrome.tabs.sendMessage<M, R>(this.tabId, message);
    }

    public sendCmd<M = any, R = any>(cmd: string, message?: M) : Promise<R> {
        const msg = Object.assign(
            { [CmdKey]: cmd },
            message
        );

        return this.sendMessage(msg);
    }

    collectScreenshot(): Promise<Blob> {
        return chrome.tabs.captureVisibleTab()
            .then(dataUrl => dataURItoBlob(dataUrl));
    }
}

function dataURItoBlob(dataURI: string) {
    return fetch(dataURI).then(res => res.blob());
/*
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
*/
}



