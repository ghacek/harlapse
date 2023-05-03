'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

console.log("background", chrome.action.onClicked);


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      console.log("oncomplete", details);
    },
    {urls: ["<all_urls>"]},
    []
);