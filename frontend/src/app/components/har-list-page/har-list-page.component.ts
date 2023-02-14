import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  templateUrl: './har-list-page.component.html',
  styleUrls: ['./har-list-page.component.scss']
})
export class HarListPageComponent {

    hars?: any;

    constructor(private http: HttpClient) {
        http.get("http://localhost:8080/api/list")
            .subscribe(x => this.hars = x);
    }

}
