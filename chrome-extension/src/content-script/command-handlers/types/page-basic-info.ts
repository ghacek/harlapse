export interface PageBasicInfo {
    title: string,
    url: string,
    userAgent: string,
    language: string,
    languages: string[],
    deviceMemory: number,
    hardwareConcurrency: number,
    maxTouchPoints: number,
    timezoneOffset: number,
    intl: PageIntlInfo

    browser: string,
    os: string
}

export interface PageIntlInfo {
    dateTimeFormat: Intl.ResolvedDateTimeFormatOptions,
    //listFormat: Intl.ResolvedListFormatOptions,
    numberFormat: Intl.ResolvedNumberFormatOptions
    pluralRules: Intl.ResolvedPluralRulesOptions,
    relativeTimeFormat: Intl.ResolvedRelativeTimeFormatOptions,
    //segmenter: Intl.ResolvedDisplayNamesOptions
}