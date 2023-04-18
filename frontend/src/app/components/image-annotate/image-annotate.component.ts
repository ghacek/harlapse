import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PolylinePainter } from './polilyne-painter';

@Component({
    selector: 'app-image-annotate',
    templateUrl: './image-annotate.component.html',
    styleUrls: ['./image-annotate.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        "[style.background-image]": "'url(' + imageUrl + ')'"
    }
})
export class ImageAnnotateComponent {

    private path?: PolylinePainter;

    @Input()
    public imageUrl: string = "";

    @ViewChild('svg')
    svgRef!: ElementRef<SVGElement>;

    ngAfterViewInit() {
        this.svgRef.nativeElement.addEventListener("mousedown", this.startDrawing);
    }

    startDrawing = (event: MouseEvent) => {
        const svg = this.svgRef.nativeElement;

        this.path = new PolylinePainter(svg);

        svg.addEventListener("mousemove", this.updateDrawing);
        svg.addEventListener("mouseup", this.stopDrawing);
        svg.addEventListener("mouseleave", this.stopDrawing);
    }

    private updateDrawing = (event: MouseEvent) => {
        const svg = this.svgRef.nativeElement;
        const bounds = svg.getBoundingClientRect();

        const x = event.clientX - bounds.left;
        const y = event.clientY - bounds.top;

        this.path!.addPoint({x, y});
    }

    private stopDrawing = (event: MouseEvent) => {
        const svg = this.svgRef.nativeElement;
        svg.removeEventListener("mousemove", this.updateDrawing);
        svg.removeEventListener("mouseup", this.stopDrawing);
        svg.removeEventListener("mouseleave", this.stopDrawing);

        this.path!.addSimplifiedCurve(svg);
    }
}






