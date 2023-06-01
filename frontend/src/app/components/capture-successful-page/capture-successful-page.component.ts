import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SnapshotControllerService } from 'src/api/services';
import { ImageAnnotateComponent } from '../image-annotate/image-annotate.component';
import { firstValueFrom } from 'rxjs';

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

          firstValueFrom(this.snapshotController.getShanpshotInfo({ ref }))
            .then(snapshotInfo => {
                //this.snapshotInfo = snapshotInfo;

                this.screenshotUrl = snapshotInfo.screenshotLink;
                this.backgroundUrl = "url(" + this.screenshotUrl + ")";
            })

          this.ref = ref;

        });
    }

    updateTitleAndDesc(title: string, description: string) {
        let annConfigBlob;
        let annSvgBlob;

        if (this.imageAnnotate && this.imageAnnotate.hasAnnotations()) {
            const annConfig = JSON.stringify(this.imageAnnotate.getAnnotationConfiguration());
            const annSvg = this.imageAnnotate.getAnnotationSvg() || "";

            annConfigBlob = new Blob([annConfig], { type: 'application/json' });
            annSvgBlob = new Blob([annSvg], { type: 'image/svg+xml' });
        }

        const params = {
            ref: this.ref!, 
            body: {
                title, 
                description,
                "annotations-config": annConfigBlob,
                "annotations-svg": annSvgBlob
            }
        }
        this.snapshotController.finalizeSnapshotCapture(params)
            .subscribe(() => {
                this.router.navigate(['/view', this.ref])
            });
    }

}
