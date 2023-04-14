import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { apiScreenshotUrl } from 'src/app/util/api-util';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './capture-successful-page.component.html',
  styleUrls: ['./capture-successful-page.component.scss']
})
export class CaptureSuccessfulPageComponent {

    ref?: string;

    backgroundUrl?: string;

    constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
          const ref = params['ref'];

          this.ref = ref;
          this.backgroundUrl = "url(" + apiScreenshotUrl(ref) + ")";
        });
    }

    updateTitleAndDesc(title: string, description: string) {
        const body = {
            title, description
        }
        this.http.post(environment.apiRootUrl + "/api/snapshot/" + this.ref + "/title-and-desc", body)
            .subscribe(x => {
                this.router.navigate(['/view', this.ref])
            });
    }

}
