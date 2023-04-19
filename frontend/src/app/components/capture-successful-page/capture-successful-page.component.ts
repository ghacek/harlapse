import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotControllerService } from 'src/api/services';
import { apiScreenshotUrl } from 'src/app/util/api-util';
import { ImageAnnotateComponent } from '../image-annotate/image-annotate.component';

@Component({
  templateUrl: './capture-successful-page.component.html',
  styleUrls: ['./capture-successful-page.component.scss']
})
export class CaptureSuccessfulPageComponent {

    @ViewChild(ImageAnnotateComponent)
    imageAnnotate?: ImageAnnotateComponent;


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
        console.log("config", this.imageAnnotate?.getAnnotationConfiguration());

        return;

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
