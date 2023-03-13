import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log as HarLog } from 'har-format';
import { Entry, Page } from 'har-format';


export interface PageView extends Page {
    /** Date object created from startedDateTime */
    startDate: Date,

    /** Unix timestamp of startDate */
    startMilis: number,
}

export interface EntryView extends Entry {
    /** Date object created from startedDateTime */
    startDate: Date,

    /** Unix timestamp of startDate */
    startMilis: number,

    /** startDate offset from first request start  */
    offsetTime: number,

    /** If true, details will be displayed in the UI.  */
    detailsOpened?: boolean
}

@Component({
  templateUrl: './har-view-page.component.html',
  styleUrls: ['./har-view-page.component.scss']
})
export class HarViewPageComponent {

    id?: string;

    har?: HarLog;

    pageViews?: PageView[];

    entryViews?: EntryView[];

    /** Defines if loaded HAR file contains requests from multiple pages. */
    multiplePages = false;

    /** Start time of the first page in loaded HAR file */
    harStart?: Date;

    /** Time of last request + its execution time. */
    harEndMilis: number = 0;

    /** Difference between startTime and endTimeMilis in milliseconds. */
    harDuration: number = 0;

    constructor(private http: HttpClient, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.queryParamMap.subscribe(params => {
          const id = params.get('id');
          

          if (id) {
            this.loadHar(id);
          }
        });
    }

    fileNameFromURL(url: string) {
        const index = url.lastIndexOf('/');
        if (index) {
            return url.substring(index + 1);
        }

        return url;
    }

    private loadHar(id: string) {
        this.id = id;
        this.http.get<HarLog>("http://localhost:8080/api/har?id=" + id)
            .subscribe(har => {
                this.setHar(har);
            });
    }

    private setHar(har: HarLog) {
        this.har = har;
        this.multiplePages = !!(har && har.pages && har.pages.length > 1);

        return this.findFirstStartDate(har)
            && this.setEntryOffsetTimes(har);
    }

    private findFirstStartDate(har: HarLog) {
        const pages = har.pages || [];

        const pageViews: PageView[] | undefined  = populateStartDateTime(pages);
        if (!pageViews) {
            return false;
        }

        // sort pages by startedDateTime
        pageViews.sort((a, b) => a.startMilis - b.startMilis);

        this.pageViews = pageViews;

        return true;
    }

    private setEntryOffsetTimes(har: HarLog) {
        if (!har.entries || har.entries.length === 0) {
            return true;
        }

        const entryViews: EntryView[] | undefined  = populateStartDateTime(har.entries!, { offsetTime: 0, detailsOpened: true });

        if (!entryViews) {
            return false;
        }

        const harStartMilis = Math.min(
            ...entryViews.map(x => x.startMilis),
            Math.min( 
                ...this.pageViews!.map(x => x.startMilis)
            )
        );

        const harEndMilis = Math.max( 
            ...entryViews.map(x => x.startMilis + x.time),
        )

        entryViews.forEach(
            entry => entry.offsetTime = (entry.startMilis - harStartMilis)
        );

        // sort pages by startedDateTime
        entryViews.sort((a, b) => a.startMilis - b.startMilis);

        this.entryViews = entryViews;
        this.harEndMilis = harEndMilis;
        this.harStart = new Date(harStartMilis);
        this.harDuration = harEndMilis - harStartMilis;

        return true;
    }

    log(a: any) {
        console.log(a);
    }

    timingWidth(value: number | undefined) {
        if (!value || value < 0) {
            return 0;
        }

        return (value / this.harDuration! * 100).toFixed(2);
    }

        
    statusToClass(entry: EntryView) {
        return "sc-" + Math.floor(entry.response.status / 100);
    }

}


interface HasStartedDateTime {
    startedDateTime: string
}

interface HasStartDate {
    startDate: Date,
    startMilis: number
}

function populateStartDateTime<T extends HasStartedDateTime, K extends {}>(items: T[], defaults?: K) : Array<T & HasStartDate & K> | undefined {
    const views: Array<T & HasStartDate & K> = [];

    for (const entry of items) {
        const startDate = new Date(entry.startedDateTime);
        const startMilis = startDate.getTime();

        if (isNaN(startMilis)) {
            console.error("Entry has invalid startedDateTime. ", entry);
            return undefined;
        }

        const view = Object.assign(
            { startMilis, startDate }, 
            defaults,
            entry
        );
        views.push(view);
    }

    return views;
}
