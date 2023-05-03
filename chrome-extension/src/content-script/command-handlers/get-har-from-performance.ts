



export function getHarFromPerformance() {
    const entries = <PerformanceResourceTiming[]>window.performance.getEntriesByType("resource");

    const har = {
        "version": "1.2",
        "creator": {
            "name": "Harlapse by window.performance",
            "version": "0.1"
        },
        "pages": [],
        "entries": <any[]>[]
    }

    const timeOrigin = window.performance.timeOrigin;

    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
    for (const entry of entries) {
        har.entries.push({
            _initiator: {
                "type": entry.initiatorType,
            },
            request: {
                method: "GET", // NOT GOOD
                url: entry.name,
                httpVersion: entry.nextHopProtocol,
                // TODO query string
            },
            response: {
                status: (<any>entry).responseStatus,
                httpVersion: entry.nextHopProtocol,
                content: {
                    size: entry.decodedBodySize
                },
                _transferSize: entry.transferSize,
            },
            startedDateTime: new Date(timeOrigin + entry.startTime).toISOString(),
            time: entry.duration,
            "timings": {
                "blocked": (entry.connectStart === 0) ? 0 : (entry.connectStart - entry.startTime),
                "dns": entry.domainLookupEnd - entry.domainLookupStart,
                "ssl": entry.requestStart - entry.secureConnectionStart,
                "connect": entry.connectEnd - entry.connectStart,
                "send": entry.responseStart - entry.requestStart, // not good
                "wait": 0, // not good
                "receive": (entry.responseStart === 0) ? entry.duration : (entry.responseEnd - entry.responseStart),
                //"_blocked_queueing": 0.44700002763420343
            }
        });
    }

    return har;
}