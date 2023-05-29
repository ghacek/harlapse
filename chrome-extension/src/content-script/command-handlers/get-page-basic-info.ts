import { PageBasicInfo } from "./types/page-basic-info";


export function getPageBasicInfo() : PageBasicInfo {
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
        }
    };

    console.error("------------ basicInfo4", ret);

    return ret;
}


