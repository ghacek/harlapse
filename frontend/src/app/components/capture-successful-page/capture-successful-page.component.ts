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
        const annConfig = JSON.stringify(this.imageAnnotate?.getAnnotationConfiguration());
        const annSvg = this.imageAnnotate?.getAnnotationSvg() || "";

        const params = {
            ref: this.ref!, 
            body: {
                title, 
                description,
                "annotations-config": new Blob([annConfig], { type: 'application/json' }),
                "annotations-svg": new Blob([annSvg], { type: 'image/svg+xml' })
            }
        }
        this.snapshotController.finalizeSnapshotCapture(params)
            .subscribe(() => {
                this.router.navigate(['/view', this.ref])
            });
    }

}
