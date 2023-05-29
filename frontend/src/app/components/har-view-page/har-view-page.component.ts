import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log as HarLog } from 'har-format';
import { Entry, Page } from 'har-format';
import { DrawerComponent } from '../drawer/drawer.component';
import { environment } from 'src/environments/environment';
import { SnapshotControllerService } from 'src/api/services';
import { Snapshot } from 'src/api/models';
import { apiAnnotationSvgUrl } from 'src/app/util/api-util';


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


    @ViewChild(DrawerComponent, { static: true })
    drawer!: DrawerComponent;

    id?: string;

    har?: HarLog;

    pageViews?: PageView[];

    entryViews?: EntryView[];

    drawerEntry?: EntryView;

    showScreenshotFullscreen = false;
    showAnnotations = true;

    /** Defines if loaded HAR file contains requests from multiple pages. */
    multiplePages = false;

    /** Start time of the first page in loaded HAR file */
    harStart?: Date;

    /** Time of last request + its execution time. */
    harEndMilis: number = 0;

    /** Difference between startTime and endTimeMilis in milliseconds. */
    harDuration: number = 0;

    dropInfo?: Snapshot;

    consoleLog?: any[];

    capturedHtml?: string;
    annotationsUrl?: string;
    basicInfo?: any;


    constructor(
            private snapshotController: SnapshotControllerService,
            private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
          const ref = params['ref'];

          if (ref) {
            this.id = ref;
            this.loadDropInfo(ref);
            this.loadBasicInfo(ref);
            this.loadHar(ref);
            this.loadConsole(ref);
            this.loadHtml(ref);
          }
        });
    }

    doShowScreenshotFullscreen() {
        this.showScreenshotFullscreen = true;
        this.showAnnotations = true;
    }

    copyHtmlToClipboard() {
        navigator.clipboard.writeText(this.capturedHtml!);
    }

    downloadHtml() {
        const blob = new Blob([this.capturedHtml!], {type: 'text/csv'});
    
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = "captured.html";
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    fileNameFromURL(url: string) {
        const index = url.lastIndexOf('/');
        if (index) {
            const lastSegment = url.substring(index + 1);

            if (lastSegment) {
                return lastSegment;
            }
            else {
                // If last segment is empty, we return the one before that.
                const secondIndex = url.lastIndexOf('/', index - 1);

                return url.substring(secondIndex + 1);
            }
        }

        return url;
    }

    private loadDropInfo(ref: string) {
        this.snapshotController.getShanpshotInfo({ ref })
            .subscribe(dropInfo => {
                console.log("dropInfo", dropInfo)
                this.dropInfo = dropInfo;

                if (dropInfo.hasAnnotations) {
                    this.annotationsUrl = apiAnnotationSvgUrl(ref);
                }
            });
    }

    private loadBasicInfo(ref: string) {
        this.snapshotController.getSnapshotBasicInfo({ ref })
            .subscribe(x => {
                this.basicInfo = x;
            });
    }

    private loadHar(ref: string) {
        this.snapshotController.getSnapshotNetwork({ ref })
            .subscribe(har => {
                this.setHar(<HarLog>har);
            });
    }

    private loadConsole(ref: string) {
        this.snapshotController.getSnapshotConsoleLog({ ref })
            .subscribe(log => {
                this.consoleLog = <any>log;
            });
    }

    private loadHtml(ref: string) {
        this.snapshotController.getSnapshotHtml({ ref })
            .subscribe(html => {
                this.capturedHtml = html;
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

        //this.drawerEntry = entryViews.length > 0 ? entryViews[10] : undefined;
        //this.drawer.visible = true;

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

    showEntry(entry: EntryView) {
        console.log("Show entry", entry);
        this.drawerEntry = entry;
        this.drawer.visible = true;
    }

    // UI proxy
    apiRootUrl = environment.apiRootUrl;

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
