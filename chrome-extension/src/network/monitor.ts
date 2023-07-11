import { QueryString, Header, Cookie, PostData } from 'har-format';
import { createLokiLogger } from '../util/grafana-loki-logging';

// TODO handle onTabReplaced event
//    If a navigation was triggered via Chrome Instant or Instant Pages, a completely loaded page is swapped into the current tab. In that case, an onTabReplaced event is fired.


const ignoreUrls = [
    "https://api-iam.intercom.io/messenger/web/events",
    "https://rs.grafana.com/v1/track"
];

// TODO ignore chrome-extension://

const logger = createLokiLogger("network-monitor");

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
        { urls: ["<all_urls>"] },
        ["requestBody"]
    );

    chrome.webRequest.onSendHeaders.addListener(
        onSendHeaders,
        { urls: ["<all_urls>"] },
        ["requestHeaders", "extraHeaders"]
    );
    chrome.webRequest.onCompleted.addListener(
        onCompleted,
        { urls: ["<all_urls>"] },
        ["responseHeaders", "extraHeaders"]
    );

    chrome.webNavigation.onBeforeNavigate.addListener(
        onBeforeNavigate
    );
    chrome.webNavigation.onCommitted.addListener(
        onCommittedNavigate
    );
}

function shouldIgnore(details: {url: string, tabId: number}) {
    if (details.tabId <= 0) {
        return true;
    }

    const isInIgnoreList = ignoreUrls.some(url => details.url.startsWith(url));
    if (isInIgnoreList) {
        return true;
    }

    return false;
}

function onBeforeNavigate(details: chrome.webNavigation.WebNavigationParentedCallbackDetails) {
    if (shouldIgnore(details)) {
        return;
    }
    logger("webNavigation.onBeforeNavigate", details.tabId, details.url);
    //console.log("webNavigation.onBeforeNavigate", details);

    const isTopFrame = (details.frameId === 0);

    if (isTopFrame) {
        // Clear network entries that were captured until last navigation event
        const tab = networkLog[details.tabId];
        if (tab) {
            // If tab exists last record is the load of the new document that we are navigating to.
            // TODO make sure this holds in all cases
            const lastRecord = tab[tab.length - 1];

            networkLog[details.tabId] = [lastRecord];
        }
        else {
            delete networkLog[details.tabId];
        }
    }
    else {
        //console.log("Ignoring onBeforeNavigate because not top frame", details);
    }


}

function onCommittedNavigate(details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
    //console.log("webNavigation.onCommitted", details);
}


function onBeforeRequest(details: chrome.webRequest.WebRequestBodyDetails) {
    if (shouldIgnore(details)) {
        return;
    }

    logger("webRequest.onBeforeRequest", details.tabId, details.url);
    //console.log("webRequest.onBeforeRequest", details);

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
    if (shouldIgnore(details)) {
        return;
    }

    let request = getRequest(details.tabId, details.requestId);
    if (!request) {
        //console.debug("Ignoring onSendHeaders because request not initialized", details);
        return;
    }

    request.onSendHeaders = details;

    //console.log("webRequest.onSendHeaders", details);
}


function onCompleted(details: chrome.webRequest.WebResponseCacheDetails) {
    if (shouldIgnore(details)) {
        return;
    }

    let request = getRequest(details.tabId, details.requestId);
    if (!request) {
        //console.debug("Ignoring onCompleted because request not initialized", details);
        return;
    }

    request.onCompleted = details;

    //console.log("webRequest.onCompleted", details, request);
}

function getRequest(tabId: number, requestId: string) {
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
                startedDateTime: new Date(r.onBeforeRequest!.timeStamp).toISOString(),
                time: r.onCompleted!.timeStamp - r.startTime,
                request: {
                    method: r.onSendHeaders!.method,
                    url: r.onSendHeaders!.url,
                    httpVersion: "", // cannot be detected as onCompleted.statusLine is always HTTP/1.1
                    cookies: parseCookiesFromHeaders(r.onSendHeaders!.requestHeaders),
                    headers: convertHeaderList(r.onSendHeaders!.requestHeaders),
                    queryString: convertUrlToQueryString(r.onSendHeaders!.url),
                    postData: convertRequestBodyToPostData(r.onSendHeaders!, r.onBeforeRequest!),
                    headersSize: calcHeaderSize(r.onSendHeaders!.requestHeaders),
                    bodySize: parseContentLength(r.onSendHeaders!.requestHeaders)
                },
                response: {
                    status: r.onCompleted!.statusCode,
                    statusText: "",
                    httpVersion: "", // cannot be detected as onCompleted.statusLine is always HTTP/1.1
                    headers: convertHeaderList(r.onCompleted!.responseHeaders),
                    cookies: parseSetCookieAttributes(r.onCompleted!.responseHeaders),
                    content: {
                        size: -1,
                        mimeType: "text/plain"
                    },
                    headersSize: calcHeaderSize(r.onCompleted!.responseHeaders),
                    bodySize: parseContentLength(r.onCompleted!.responseHeaders),
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
                    receive: r.onCompleted!.timeStamp - r.onBeforeRequest!.timeStamp
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

function convertEventTypeToHarType(type: String) {
    switch (type) {
        case "main_frame": return "document";
        case "sub_frame": return "document";
        case "xmlhttprequest": return "xhr";
        default: return type;
    }
}



/**
 * Converts a given URL string to a query string array.
 *
 * @param urlString - The URL string to be converted.
 * @return An array of query string objects containing name-value pairs.
 */
function convertUrlToQueryString(urlString: string) {
    let url;
    try {
        url = new URL(urlString);
    } catch (ex) {
        console.error("Failed to parse URL", ex);
        return [];
    }

    const searchParams = url.searchParams;

    const queryParams: QueryString[] = [];

    searchParams.forEach((value, key) => {
        queryParams.push({
            name: key,
            value: value
        });
    });

    return queryParams;
}

function convertHeaderList(headers: chrome.webRequest.HttpHeader[] | undefined): Header[] {
    if (!headers) {
        return [];
    }

    return headers.map(h => ({
        name: h.name,
        value: h.value ?? ""
    }))
}

/**
 * Calculates the size of the headers based on the provided HttpHeader array.
 * This is an approximation based on the size based on parsed values, not real 
 * request content.
 *
 * @param headers - An array of HttpHeader objects or undefined.
 * @return The calculated size of the headers.
 */
function calcHeaderSize(headers: chrome.webRequest.HttpHeader[] | undefined): number {
    if (!headers) {
        return 0;
    }

    let size = 0;

    headers.forEach(h => {
        size += h.name.length + (h.value ?? "").length + 4; // 4 for ": " and "\r\n"
    });

    return size;
}

function parseCookiesFromHeaders(headersArray: chrome.webRequest.HttpHeader[] | undefined): Cookie[] {
    if (!headersArray) {
        return [];
    }

    const cookies: Cookie[] = [];

    // Iterate over each header object
    for (let i = 0; i < headersArray.length; i++) {
        const header = headersArray[i];
        const headerName = header.name.toLowerCase();

        // Check if the header is a "cookie" header
        if (headerName === "cookie") {
            const headerValue = header.value ?? "";
            // Split the header value into individual cookies
            const cookieArr = headerValue.split(";");

            // Iterate over each cookie
            for (let j = 0; j < cookieArr.length; j++) {
                const cookie = cookieArr[j].trim();

                // Split the cookie into name and value
                const [name, value] = cookie.split("=", 2);

                // Store the cookie in the cookies object
                cookies.push({
                    name,
                    value: decodeURIComponent(value)
                });
            }
        }
    }

    return cookies;
}

function parseSetCookieAttributes(headers: chrome.webRequest.HttpHeader[] | undefined): Cookie[] {
    if (!headers) {
        return [];
    }

    const cookies: Cookie[] = [];

    headers
        .filter(header => header.name.toLowerCase() === 'set-cookie')
        .forEach(header => {
            const headerValue = header.value ?? "";
            const attributes = headerValue.split(';').map(attr => attr.trim());

            if (attributes.length < 2) {
                return;
            }

            const [name, value] = attributes.shift()!.split('=');
            const cookie: Cookie = { name, value };

            attributes.forEach(attribute => {
                const [key, val] = attribute.split('=');

                switch (key.toLowerCase()) {
                    case 'path':
                        cookie.path = val;
                        break;
                    case 'domain':
                        cookie.domain = val;
                        break;
                    case 'expires':
                        cookie.expires = val;
                        break;
                    case 'httponly':
                        cookie.httpOnly = true;
                        break;
                    case 'secure':
                        cookie.secure = true;
                        break;
                    default:
                        break;
                }
            });

            cookies.push(cookie);
        });

    return cookies;
}

/**
 * Parses the content length from a given array of HTTP headers.
 *
 * @param headers The array of HTTP headers to search.
 * @return The parsed content length, or -1 if not found.
 */
function parseContentLength(headers: chrome.webRequest.HttpHeader[] | undefined): number {
    if (!headers) {
        return -1;
    }

    const contentLengthHeader = headers.find(header =>
        header.name.toLowerCase() === 'content-length'
    );

    if (contentLengthHeader && contentLengthHeader.value) {
        return parseInt(contentLengthHeader.value, 10);
    }

    return -1;
}

function convertRequestBodyToPostData(
            headerDetails: chrome.webRequest.WebRequestHeadersDetails, 
            bodyDetails: chrome.webRequest.WebRequestBodyDetails
        ) : PostData | undefined {
    
    const body = bodyDetails.requestBody;

    if (headerDetails.type === "ping") {
        // ping requests always return requestBody: {error: 'Unknown error.'}
        return;
    }

    if (bodyDetails.method === "POST") {
        console.log("post req", body, bodyDetails);
    }

    if (!body) {
        return;
    }

    
    const headers = headerDetails.requestHeaders || [];
    const mimeType = headers.find(header => header.name.toLowerCase() === 'content-type')?.value ?? "";

    if (body.formData) {
        const data = {
            mimeType,
            params: Object.keys(body.formData)
                .map(key => ({
                    name: key,
                    value: (body.formData![key] ?? []).join(";")
                }))
        } as PostData;

        console.log("post data", body);

        return data;
    }
    else if (body.raw) {
        let content = "";
        body.raw.forEach(part => {
            if (part.bytes) {
                content += new TextDecoder("utf-8").decode(part.bytes);
            }
            else {
                content += "{{file content not included}}\n";
            }
        })

        console.log("we have raw", body);


        return {
            mimeType,
            text: content,
        } as PostData;
        
    }

    return;
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