import UAParser from "ua-parser-js";
import { PageBasicInfo } from "./types/page-basic-info";


export async function getPageBasicInfo() : Promise<PageBasicInfo> {
    const uaInfo = new UAParser().getResult();

    await fixVersionForWindows(uaInfo);


    const ret = { 
        title: document.title, 
        url: location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages.concat(),
        deviceMemory: (<any>navigator).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints,

        timezoneOffset: new Date().getTimezoneOffset(),
        intl: {
            dateTimeFormat: Intl.DateTimeFormat().resolvedOptions(),
            //listFormat: new Intl.ListFormat().resolvedOptions(),
            numberFormat: Intl.NumberFormat().resolvedOptions(),
            pluralRules: new Intl.PluralRules().resolvedOptions(),
            relativeTimeFormat: new Intl.RelativeTimeFormat().resolvedOptions(),
            //segmenter: new Intl.Segmenter().resolvedOptions()
        },

        devicePixelRatio: window.devicePixelRatio,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight
        },

        browser: uaInfo.browser.name + " " + uaInfo.browser.major,
        os: uaInfo.os.name + " " + uaInfo.os.version
    };

    console.error("------------ basicInfo4", ret);

    return ret;
}

async function fixVersionForWindows(r: UAParser.IResult) {
    if (r.os.name === "Windows") {
        const userAgentData = window.navigator.userAgentData!;

        const ua = await userAgentData.getHighEntropyValues(["platformVersion"]);

        const osVersion = ua.platformVersion ?? "";

        const majorPlatformVersion = parseInt(osVersion.split('.')[0]);
        if (majorPlatformVersion >= 13) {
            r.os.version = "11";
        }
    }
}

