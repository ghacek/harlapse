import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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

const SupportedPreviewImageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/gif",
    "image/webp",
    "image/apng",
    "image/avif",
];

interface Tab {
    name: string,
    disabled?: boolean,
}

interface ResponseTab extends Tab {
    available?: boolean,
}

interface PayloadTab extends Tab {
    hasQueryString?: boolean,
    hasFormData?: boolean,

    /** Indicates if postData text will be displayed as text  */
    showText?: boolean;

    /** If payload is JSON, this will be parsed JSON object */
    json?: any;

    /** If payload contains text, this will be bare mime type, without charset or other attributes. */
    mimeType?: string;
}

interface PreviewTab extends Tab {
    /** If true - response contains  image and we will show it as <img> */
    showImage?: boolean,
    /** If true - response contains HTML and we will show it in <iframe> */
    showHtml?: boolean,

    /** 
     * If response is JSON, this will be populated with parsed value and JSON 
     * viewer will be used to display the content.
     */
    json?: any;
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

    tabPreview: PreviewTab = {
        name: "Preview",
    };

    tabResponse: ResponseTab = {
        name: "Response",
    };

    tabs: Tab[] = [
        this.tabHeaders,
        this.tabPayload,
        this.tabPreview,
        this.tabResponse
    ];

    selectedTabe = this.tabHeaders;

    constructor(
        private sanitizer: DomSanitizer,
    ) {}

    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entry']) {
            this.selectedTabe = this.tabHeaders;
            this.tabResponse.available = this.isResponseTabAvailable(this.entry);
            this.configurePayloadTab(this.entry);
            this.configurePreviewTab(this.entry);
        }
    }

    private isResponseTabAvailable(entry: EntryView) {
        const mimeType = entry.response.content.mimeType;

        return EditorAllowedMimeTypes.includes(mimeType);
    }
    private configurePayloadTab(entry: EntryView) {
        const postData = entry.request.postData;
        const tabPayload = this.tabPayload;

        tabPayload.hasQueryString = (entry.request.queryString && entry.request.queryString.length > 0);
        tabPayload.hasFormData = (postData && postData.params && postData.params.length > 0);

        if (postData && postData.mimeType) {
            const mimeTypeParts = postData.mimeType.split(";");
            const mimeType = mimeTypeParts[0].trim();

            const isJsonMime = (mimeType === "application/json");

            if (isJsonMime && postData.text) {
                const json = JSON.parse(postData.text);

                tabPayload.showText = false;
                tabPayload.json = json;
            }
            else {
                const canShowMimeType = EditorAllowedMimeTypes.includes(mimeType);

                tabPayload.mimeType = mimeType;
                tabPayload.showText = canShowMimeType && !tabPayload.hasFormData;
            }
        }
        else {
            tabPayload.mimeType = undefined;
            tabPayload.showText = false;
        }

        const showTab = tabPayload.hasQueryString || tabPayload.hasFormData || tabPayload.showText || !!tabPayload.json;

        tabPayload.disabled = !showTab;
    }

    private configurePreviewTab(entry: EntryView) { 
        const content = entry.response.content;
        const tabPreview = this.tabPreview;

        const isBase64 = (content.encoding === "base64");

        // -- Check if response is an image we can display
        const isImageMime = SupportedPreviewImageMimeTypes.includes(content.mimeType);

        const showImagePreview = isImageMime && isBase64;

        // -- Check if response is HTML we can display
        const isHtmlMime = (content.mimeType === "text/html" || content.mimeType === "application/xhtml+xml");

        // -- Check if response is HTML we can display
        const isJsonMime = (content.mimeType === "application/json");
        const json = (isJsonMime && content.text) ? JSON.parse(content.text) : undefined;

        tabPreview.json = json;

        tabPreview.showImage = showImagePreview;
        tabPreview.showHtml = isHtmlMime
        tabPreview.disabled = !(showImagePreview || isHtmlMime || !!json);
    }



    decodePostParam(param?: string) {
        return param ? decodeURIComponent(param) : "";
    };


    htmlPreviewDataUrl(entry: EntryView) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            'data:' + entry.response.content.mimeType + ',' +  encodeURIComponent(entry.response.content.text ?? '')
        );
    }
    

    // -- UI proxy
    encodeURIComponent = encodeURIComponent;
}
