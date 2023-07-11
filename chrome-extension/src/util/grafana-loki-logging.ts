
const consoleFunctions = [
    'assert',
    'clear',
    'count',
    'countReset',
    'debug',
    'dir',
    'dirxml',
    'error',
    'group',
    'groupCollapsed',
    'groupEnd',
    'info',
    'log',
    'table',
    'time',
    'timeEnd',
    'timeLog',
    'trace',
    'warn',
];

const lokiUrl = "https://logs-prod-012.grafana.net/loki/api/v1/push";
const lokuUsername = "641566";
const lokiPassword = "eyJrIjoiNmNmY2NmMjFiZjhhMmQ0ZDM5YjFhNmM1NTUxYTcyNTJjNTk2MGJhYiIsIm4iOiJIYXJsYXBzZSBsb2dzIGV4dGVuc2lvbiIsImlkIjo4OTY1MzR9";



export function setupLokiConsoleLogging() {
    consoleFunctions.forEach(functionName => {
        const consoleObject = console as any;

        const originalFunction = consoleObject[functionName];
        consoleObject[functionName] = function (...args: any[]) {
            originalFunction.apply(console, args);

            lokiLog({ source: "console." + functionName }, args)
        }
    });
}

export function createLokiLogger(category: string, labels?: Record<string, string>) {
    const labelsWithCategory = Object.assign(
        { category },
        labels
    );

    return (...args: any[]) => {
        console.log(...args);

        lokiLog(
            labelsWithCategory, 
            args.length === 1 ? args[0] : args
        );
    }
}

export function lokiLog(labels: Record<string, string>, content: any) {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", 'Basic ' + btoa(lokuUsername + ":" + lokiPassword));

    const exLabels = Object.assign(
        { app: "harlapse"},
        labels
    );

    fetch(lokiUrl, {
        keepalive: true,
        method: "POST",
        headers,
        body: JSON.stringify({
            streams: [{
                stream: exLabels,
                values: [
                    [(Date.now() * 1000000).toString(), JSON.stringify(content)],
                ]
            }]
        })
    });

    
}

