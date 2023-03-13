import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EntryView } from '../har-view-page/har-view-page.component';

interface Tab {
    name: string,
    disabled?: boolean,
}

interface ResponseTab extends Tab {
    available?: boolean
}

interface PayloadTab extends Tab {
}

@Component({
  selector: 'app-har-entry-view',
  templateUrl: './har-entry-view.component.html',
  styleUrls: ['./har-entry-view.component.scss']
})
export class HarEntryViewComponent implements OnChanges {

    @Input()
    public entry!: EntryView;

    tabHeaders: Tab = {
        name: "Headers"
    };

    tabPayload: Tab = {
        name: "Payload"
    };

    tabResponse: ResponseTab = {
        name: "Response",
    };

    tabs: Tab[] = [
        this.tabHeaders,
        this.tabPayload,
        this.tabResponse
    ];

    selectedTabe = this.tabPayload;

    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entry']) {
            this.tabResponse.available = this.isResponseTabAvailable(this.entry);
            this.tabPayload.disabled = !this.isPayloadTabAvailable(this.entry);
        }
    }

    private isResponseTabAvailable(entry: EntryView) {
        const allowed = [
            "text/plain", 
            "text/csv", 
            "text/css", 
            "text/html",
            "text/calendar", 
            "text/javascript",
            "text/xml",
            "application/javascript",
            "application/json",
            "application/ld+json",
            "image/svg+xml",
            "application/xhtml+xml",
            "application/xml",
            "application/atom+xml",
        ];

        const mimeType = entry.response.content.mimeType;

        return allowed.includes(mimeType)
    }

    private isPayloadTabAvailable(entry: EntryView) {

        const hasPostData = !!entry.request.postData;

        return hasPostData;
    }


    decodePostParam(param?: string) {
        return param ? decodeURIComponent(param) : "";
    };
}
