

// TODO handle onTabReplaced event
//    If a navigation was triggered via Chrome Instant or Instant Pages, a completely loaded page is swapped into the current tab. In that case, an onTabReplaced event is fired.

interface LogEntry {
    requestId: string
    onBeforeRequest?: chrome.webRequest.WebRequestBodyDetails;
    onSendHeaders?: chrome.webRequest.WebRequestHeadersDetails;
    onCompleted?: chrome.webRequest.WebResponseCacheDetails;
    startTime: number;
};

const networkLog: {
    [key: number]: LogEntry[]
} = {};

export function initNetworkMonitor() {
    
    chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequest,
        {urls: ["<all_urls>"]},
        ["requestBody"]
    );

    chrome.webRequest.onSendHeaders.addListener(
        onSendHeaders,
        {urls: ["<all_urls>"]},
        ["requestHeaders", "extraHeaders"]
    );
    chrome.webRequest.onCompleted.addListener(
        onCompleted,
        {urls: ["<all_urls>"]},
        ["responseHeaders", "extraHeaders"]
    );

    chrome.webNavigation.onBeforeNavigate.addListener(
        onBeforeNavigate
    );
    chrome.webNavigation.onCommitted.addListener(
        onCommittedNavigate
    );
}

function onBeforeNavigate(details: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
    //console.log("webNavigation.onBeforeNavigate", details);

    const isTopFrame = (details.frameId === 0);

    if (isTopFrame) {
        // Clear network entries that were captured until last navigation event
        delete networkLog[details.tabId];
    } 
    else {
        //console.log("Ignoring onBeforeNavigate because not top frame", details);
    }

    
}

function onCommittedNavigate(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    //console.log("webNavigation.onCommitted", details);
}


function onBeforeRequest(details: chrome.webRequest.WebRequestBodyDetails) {
    if (details.tabId <= 0) {
        return;
    }

    let tab: LogEntry[] = networkLog[details.tabId];
    if (!tab) {
        tab = networkLog[details.tabId] = [];
    }

    tab.push({
        requestId: details.requestId,
        startTime: details.timeStamp,
        onBeforeRequest: details
    });
}

function onSendHeaders(details: chrome.webRequest.WebRequestHeadersDetails) {
    let request = getRequest(details.tabId, details.requestId);

    if (!request) {
        //console.debug("Ignoring onSendHeaders because request not initialized", details);
        return;
    }

    request.onSendHeaders = details;

    console.log("webRequest.onSendHeaders", details);
}


function onCompleted(details: chrome.webRequest.WebResponseCacheDetails) {
    let request = getRequest(details.tabId, details.requestId);

    if (!request) {
        //console.debug("Ignoring onCompleted because request not initialized", details);
        return;
    }

    request.onCompleted = details;

    console.log("webRequest.onCompleted", details, request);
}

function getRequest(tabId: number, requestId: string) {
    if (tabId <= 0) {
        return;
    }

    const tab = networkLog[tabId];
    if (!tab) {
        return;
    }

    return tab.find((r: any) => r.requestId === requestId);
}


export function networkLogAll(tabId: number) {
    console.log(networkLog[tabId]);
}

function convertLogToHar(tabId: number) {
    const tab = networkLog[tabId];

    if (!tab) {
        return;
    }

    console.log("converting tab", tab);

    const entries = tab
        .filter(r => (r.onSendHeaders && r.onCompleted))
        .map((r: LogEntry) => {
            return {
                startedDateTime: new Date(r.onSendHeaders!.timeStamp).toISOString(),
                time: r.onCompleted!.timeStamp - r.startTime,
                request: {
                    method: r.onSendHeaders!.method,
                    url: r.onSendHeaders!.url,
                    httpVersion: "??", // TODO detect from statusLine,
                    cookies: [], // TODO parse cookies from headers
                    headers: (r.onSendHeaders!.requestHeaders ?? []).map(h => ({
                            name: h.name,
                            value: h.value ?? ""
                        })),
                    queryString: [], // TODO parse query string from URL
                    postData: undefined, // TODO parse from  r.onBeforeRequest?.requestBody
                    headersSize: -1, // TODO calc form headers array
                    bodySize: -1 // TODO calc form WebRequestBody 
                },
                response: {
                    status: r.onCompleted!.statusCode,
                    statusText: r.onCompleted!.statusLine,
                    httpVersion: "??", // TODO detect from statusLine,
                    headers: (r.onCompleted!.responseHeaders ?? []).map(h => ({
                        name: h.name,
                        value: h.value ?? ""
                    })),
                    cookies: [], // TODO parse cookies from headers
                    content: {
                        size: -1,
                        mimeType: "text/plain"
                    },
                    headersSize: -1, // TODO calc form headers array
                    bodySize: -1, // TODO calc form WebRequestBody
                    redirectURL: ""
                },
                cache: {
                    
                },
                timings: {
                    blocked: -1,
                    dns: -1,
                    connect: -1,
                    send: -1,
                    wait: -1,
                    receive: -1
                },
                serverIPAddress: r.onCompleted!.ip,
                _fromCache: r.onCompleted!.fromCache ? "disk" : undefined,
                _resourceType: convertEventTypeToHarType(r.onCompleted!.type),
            } as HARFormatEntry;
        });

    console.log("entries2", entries);

    return {
        "version": "1.2",
        "creator": {
            "name": "Harlapse by webRequest",
            "version": "0.1"
        },
        "pages": [],
        "entries": entries
    }


    // new Date(1684320731335.324).toISOString()

}

function convertEventTypeToHarType(type: String ) {
    switch(type) {
        case "main_frame": return "document";
        case "sub_frame": return "document";
        case "xmlhttprequest": return "xhr";
        default: return type;
    }
}


export function getHarForTabId(tabId: number) {
    return convertLogToHar(tabId);
}

/*
{
  "startedDateTime": "2022-01-01T00:00:00.000Z",
  "time": 200,
  "request": {
    "method": "GET",
    "url": "http://example.com",
    "httpVersion": "HTTP/1.1",
    "headers": [
      {
        "name": "User-Agent",
        "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/97.0.4692.71"
      }
    ],
    "queryString": [],
    "cookies": [],
    "headersSize": -1,
    "bodySize": -1
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "httpVersion": "HTTP/1.1",
    "headers": [
      {
        "name": "Content-Type",
        "value": "text/html; charset=UTF-8"
      }
    ],
    "cookies": [],
    "content": {
      "size": 1024,
      "mimeType": "text/html"
    },
    "headersSize": -1,
    "bodySize": -1
  },
  "cache": {},
  "timings": {
    "send": 0,
    "wait": 100,
    "receive": 100
  }
}
*/