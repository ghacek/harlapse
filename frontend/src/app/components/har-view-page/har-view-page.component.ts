import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Log as HarLog } from 'har-format';

@Component({
  templateUrl: './har-view-page.component.html',
  styleUrls: ['./har-view-page.component.scss']
})
export class HarViewPageComponent {

    id?: string;

    har?: HarLog;

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
            .subscribe(x => this.har = x);
    }

    log(a: any) {
        console.log(a);
    }

    timingWidth(value: number | undefined) {
        if (!value || value < 0) {
            return 0;
        }

        console.log("aa", value, (value / 30 * 100).toFixed(2));

        return (value / 30 * 100).toFixed(2);
    }
}
