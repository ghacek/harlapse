import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './har-list-page.component.html',
  styleUrls: ['./har-list-page.component.scss']
})
export class HarListPageComponent {

    hars?: any;

    constructor(private http: HttpClient) {
        http.get(environment.apiRootUrl + "/api/list")
            .subscribe(x => this.hars = x);
    }

}
