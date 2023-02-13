import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  templateUrl: './har-view-page.component.html',
  styleUrls: ['./har-view-page.component.scss']
})
export class HarViewPageComponent {

    har?: any;

    constructor(private http: HttpClient) {
        //http.get("http://localhost:8080/api/har?id=093ffcb3f1004ec2a51931afd03c695b")
        http.get("http://localhost:8080/api/har?id=7f96d22dcb214b429ab543e3c498413e")
            .subscribe(x => this.har = x);
    }

    fileNameFromURL(url: string) {
        const matches = url.match(/\/([^/?]+)(\?.*)?$/);
        return matches && matches[1];
/*
        const  index = url.indexOf('?');

        if (index === -1) {
            return url.slice(url.lastIndexOf('/') + 1);
        } else {
            return url.slice(url.lastIndexOf('/') + 1, index);
        }
        */
    }
}
