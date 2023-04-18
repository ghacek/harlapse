import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotControllerService } from 'src/api/services';
import { apiScreenshotUrl } from 'src/app/util/api-util';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './capture-successful-page.component.html',
  styleUrls: ['./capture-successful-page.component.scss']
})
export class CaptureSuccessfulPageComponent {

    ref?: string;

    screenshotUrl?: string;

    backgroundUrl?: string;

    constructor(
        private snapshotController: SnapshotControllerService,
        private route: ActivatedRoute, 
        private router: Router) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
          const ref = params['ref'];

          this.ref = ref;
          this.screenshotUrl = apiScreenshotUrl(ref);
          this.backgroundUrl = "url(" + this.screenshotUrl + ")";
        });
    }

    updateTitleAndDesc(title: string, description: string) {
        const params = {
            ref: this.ref!, 
            body: {
                title, description
            }
        }
        this.snapshotController.updateSnapshotTitleAndDesc(params)
            .subscribe(() => {
                this.router.navigate(['/view', this.ref])
            });
    }

}
