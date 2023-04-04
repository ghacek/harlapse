import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EntryView } from '../har-view-page/har-view-page.component';

const EditorAllowedMimeTypes = [
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

interface Tab {
    name: string,
    disabled?: boolean,
}

interface ResponseTab extends Tab {
    available?: boolean
}

interface PayloadTab extends Tab {
    hasQueryString?: boolean,
    hasFormData?: boolean,

    /** Indicates if postData text will be displayed as text  */
    showText?: boolean

    /** If payload contains text, this will be bare mime type, without charset or other attributes. */
    mimeType?: string;
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

    tabPayload: PayloadTab = {
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
            this.configurePayloadTab(this.entry);
        }
    }

    private isResponseTabAvailable(entry: EntryView) {
        const mimeType = entry.response.content.mimeType;

        return EditorAllowedMimeTypes.includes(mimeType);
    }

    private configurePayloadTab(entry: EntryView) {
        const postData = entry.request.postData;
        const hasPostData = !!entry.request.postData;

        if (postData && postData.mimeType) {
            const mimeTypeParts = postData.mimeType.split(";");
            const mimeType = mimeTypeParts[0].trim();

            const canShowMimeType = EditorAllowedMimeTypes.includes(mimeType);

            this.tabPayload.mimeType = mimeType;
        }
        else {
            this.tabPayload.mimeType = undefined;
        }


        const tabPayload = this.tabPayload;

        tabPayload.hasQueryString = (entry.request.queryString && entry.request.queryString.length > 0);
        tabPayload.hasFormData = (postData && postData.params && postData.params.length > 0);

        if (postData && postData.mimeType) {
            const mimeTypeParts = postData.mimeType.split(";");
            const mimeType = mimeTypeParts[0].trim();

            const canShowMimeType = EditorAllowedMimeTypes.includes(mimeType);

            tabPayload.mimeType = mimeType;
            tabPayload.showText = canShowMimeType && !tabPayload.hasFormData;
        }
        else {
            tabPayload.mimeType = undefined;
            tabPayload.showText = false;
        }



        const showTab = hasPostData || tabPayload.hasQueryString || tabPayload.hasFormData;

        this.tabPayload.disabled = !showTab;
    }


    decodePostParam(param?: string) {
        return param ? decodeURIComponent(param) : "";
    };
}
