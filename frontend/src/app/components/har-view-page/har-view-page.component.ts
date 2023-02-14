import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './har-view-page.component.html',
  styleUrls: ['./har-view-page.component.scss']
})
export class HarViewPageComponent {

    har?: any;

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
/*
        const  index = url.indexOf('?');

        if (index === -1) {
            return url.slice(url.lastIndexOf('/') + 1);
        } else {
            return url.slice(url.lastIndexOf('/') + 1, index);
        }
        */
    }

    private loadHar(id: string) {
        this.http.get("http://localhost:8080/api/har?id=" + id)
            .subscribe(x => this.har = x);
    }
}
