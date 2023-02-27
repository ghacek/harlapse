import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log as HarLog } from 'har-format';
import { Entry } from 'har-format';


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
        const matches = url.match(/\/([^/?]+)(\?.*)?$/);
        return matches && matches[1];
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

        for(const page of pages) {
            const startDate = new Date(page.startedDateTime);
            const startMilis = startDate.getTime();

            if (isNaN(startMilis)) {
                console.error("Page has invalid startedDateTime. Page id: " + page.id);
                return false;
            }

            page['_startDate'] = startDate;

   
        }

        // sort pages by startedDateTime
        pages.sort((a, b) => (<Date>a['_startDate']).getTime() - (<Date>b['_startDate']).getTime());

        return true;
    }

    private setEntryOffsetTimes(har: HarLog) {
        if (!har.entries || har.entries.length === 0) {
            return true;
        }

        const entryViews = [];
        let harEndMilis = 0;
        let harStartMilis = Number.MAX_VALUE;

        for (const entry of har.entries) {
            const startDate = new Date(entry.startedDateTime);
            const startMilis = startDate.getTime();
            const endMilis = startMilis + entry.time;

            if (isNaN(startMilis)) {
                console.error("Entry has invalid startedDateTime. ", entry);
                return false;
            }

            const entryView: EntryView = Object.assign(
                { startMilis, startDate, offsetTime: 0, detailsOpened: true }, entry
            );
            entryViews.push(entryView);


            harStartMilis = Math.min(harStartMilis, startMilis);
            harEndMilis   = Math.max(harEndMilis  , endMilis  );
        }

        

        for (const entry of entryViews) { 
            entry.offsetTime = (entry.startMilis - harStartMilis);
        }

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

}
