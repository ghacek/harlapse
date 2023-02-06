'use strict';

// For more information on Panels API,
// See https://developer.chrome.com/extensions/devtools_panels

// We will create a panel to detect
// whether current page is using React or not.

import './panel.css';

const ApiRoot = "http://localhost:8080/api/";
const ApiHarUpload = ApiRoot + "new-har";
const ApiHarView = ApiRoot + "har";

// chrome.devtools.inspectedWindow.eval(
//   'window.React.version',
//   (result, isException) => {
//     let message: string = '';
//     if (isException) {
//       message = 'This page doesn’t appear to be using React.';
//     } else {
//       message = `The page is using React v${result} ✅`;
//     }

//     document.getElementById('message')!.innerHTML = message;
//   }
// );

// Communicate with background file by sending a message
// chrome.runtime.sendMessage(
//   {
//     type: 'GREETINGS',
//     payload: {
//       message: 'Hello, my name is Pan. I am from Panel.',
//     },
//   },
//   (response) => {
//     console.log(response.message);
//   }
// );


document.getElementById("share-har")?.addEventListener('click', shareState);


function shareState() {
    Promise.all([captureHar(), takeScreenshot()])
        .then((args) => {
            uploadHar(args[0], args[1])
                .then((resp) => resp.json())
                .then((resp) => {
                    chrome.tabs.create({ url: ApiHarView + "?id=" + resp.id });
                })
                .catch(() => alert('HAR upload failed'));
        })
}

function uploadHar(har: any, screenshot: Blob) {
    const data = new FormData();

    const harBlob = new Blob([JSON.stringify(har)], { type: 'text/plain' });

    data.append("har", harBlob);
    data.append("ss", screenshot);

    return fetch(ApiHarUpload, {
        method: 'POST',
        body: data
    });
}


function captureHar() {
    return new Promise<HARFormatLog>((resolve) => {
        chrome.devtools.network.getHAR((har) => {
            resolve(har);
        });
    });
}


function takeScreenshot() {

    chrome.windows.getLastFocused()
        .then(focusedWin => chrome.tabs.get(chrome.devtools.inspectedWindow.tabId).then(tab => ({focusedWin, tab})))
        .then(x => {
            if (!x.tab.active || x.tab.windowId != x.focusedWin.id) {
                alert("Tab needs to be active to take a screenshot.");
            }
        })





    return chrome.tabs.captureVisibleTab()
        .then(dataUrl => dataURItoBlob(dataUrl));
}

function dataURItoBlob(dataURI: string) {
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
}
