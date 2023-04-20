import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PolylineAnnotation, PolylinePainter } from './polilyne-painter';
import { PolylineAnnotationConfig } from './polilyne-painter';

interface AnnotationImage {
    w: number,
    h: number
}

enum AnnotationType {
    "pen"
}

interface AnnotationsConfig {
    image: AnnotationImage,
    annotations: PolylineAnnotationConfig[]
}

@Component({
    selector: 'app-image-annotate',
    templateUrl: './image-annotate.component.html',
    styleUrls: ['./image-annotate.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        //"[style.background-image]": "'url(' + imageUrl + ')'"
    }
})
export class ImageAnnotateComponent {

    @Input()
    public imageUrl: string = "";

    @ViewChild('svg')
    svgRef!: ElementRef<SVGElement>;

    @ViewChild('imgContainer')
    imgContainerRef!: ElementRef<HTMLDivElement>;

    @ViewChild('canvas')
    canvasRef!: ElementRef<HTMLDivElement>;

    @ViewChild('image')
    imageRef!: ElementRef<HTMLDivElement>;

    private painter?: PolylinePainter;
    annotations: PolylineAnnotation[] = [];

    /** Original image width. */
    private imageWidth = 0;

    /** Original image height. */
    private imageHeight = 0;

    zoomLevel = 0.5;
    penSize = 8;
    penColor = "#FF0000";

    constructor(private hostRef: ElementRef<HTMLElement>, private changeDetectorRef: ChangeDetectorRef) {
    }

    ngAfterViewInit() {
        this.svgRef.nativeElement.addEventListener("mousedown", this.startDrawing);
    }

    startDrawing = (event: MouseEvent) => {
        const svg = this.svgRef.nativeElement;

        this.painter = new PolylinePainter(svg, this.penSize, this.penColor);

        svg.addEventListener("mousemove" , this.updateDrawing);
        svg.addEventListener("mouseup"   , this.stopDrawing);
        svg.addEventListener("mouseleave", this.stopDrawing);
    }

    private updateDrawing = (event: MouseEvent) => {
        const svg = this.svgRef.nativeElement;
        const bounds = svg.getBoundingClientRect();

        const x = (event.clientX - bounds.left) / this.zoomLevel;
        const y = (event.clientY - bounds.top) / this.zoomLevel;

        this.painter!.addPoint({x, y});
    }

    private stopDrawing = (event: MouseEvent) => {
        const svg = this.svgRef.nativeElement;
        svg.removeEventListener("mousemove", this.updateDrawing);
        svg.removeEventListener("mouseup", this.stopDrawing);
        svg.removeEventListener("mouseleave", this.stopDrawing);

        if (this.painter) {
            this.annotations.push(this.painter.createAnnotation());

            this.painter.destroy();
            this.painter = undefined;

            this.changeDetectorRef.markForCheck();
        }
    }

    onScreenshotLoad(event: Event) {
        const img = <HTMLImageElement>event.target;
        

        this.imageWidth = img.naturalWidth;
        this.imageHeight = img.naturalHeight;

        this.svgRef.nativeElement.setAttribute("viewBox", this.getSvgViewbox());

        this.setBestZoomLevel();
        this.canvasRef.nativeElement.style.display = "block";
    }

    private getSvgViewbox() {
        return "0 0 " + this.imageWidth + " " + this.imageHeight;
    }

    private setBestZoomLevel() {
        const imgContainerEl = this.imgContainerRef.nativeElement;

        const zoomLevel = this.calcBestZoomLevel(
            imgContainerEl.clientWidth,
            imgContainerEl.clientHeight,
            this.imageWidth, 
            this.imageHeight
        );

        this.setZoomLevel(zoomLevel);
    }

    private calcBestZoomLevel(containerW: number, containerH: number, imageW: number, imageH: number) {
        const wScale = containerW / imageW;
        const hScale = containerH / imageH;

        const minScale = Math.min(wScale, hScale);

        if (minScale >= 1) {
            return 1;
        }

        let last = this.zoomOptions[0];
        for (let i = 1; i < this.zoomOptions.length; i++) {
            const opt = this.zoomOptions[i];
            if (minScale < opt.value) {
                break;
            }
            last = opt
        }

        return last.value;
    }

    clearAnotations() {
        this.annotations.forEach(x => x.remove());
        this.annotations = [];
    }

    undoAnnotation() {
        if (this.annotations.length === 0) {
            return;
        }
        const lastIndex = this.annotations.length - 1;
        const last = this.annotations[lastIndex];

        this.annotations.splice(lastIndex, 1);

        last.remove();
    }

    toggleFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen()
                .then(() => this.setBestZoomLevel());;
        }
        else {
            const hostEl = this.hostRef.nativeElement;

            hostEl.requestFullscreen()
                .then(() => this.setBestZoomLevel());
        }


    }

    setZoomLevel(zoomLevel: number) {
        this.zoomLevel = zoomLevel;
        const canvasEl = this.canvasRef.nativeElement;
        const imageEl = this.imageRef.nativeElement;
        const svgEl = this.svgRef.nativeElement;

        const imgWidth = (this.imageWidth * zoomLevel) + "px";
        const imageHeight = (this.imageHeight * zoomLevel) + "px";

        canvasEl.style.width  = imageEl.style.width  = svgEl.style.width  = imgWidth;
        canvasEl.style.height = imageEl.style.height = svgEl.style.height = imageHeight;
    }

    setPenSize(size: number) {
        this.penSize = size;
    }

    setPenColor(color: string) {
        this.penColor = color;
    }

    public getAnnotationConfiguration(): AnnotationsConfig {
        return {
            image: {
                w: this.imageWidth,
                h: this.imageHeight
            },
            annotations: this.annotations.map(x => x.config)
        }
    }

    public getAnnotationSvg() {
        return "<svg viewbox='" + this.getSvgViewbox() + "'>"
            + this.svgRef.nativeElement.innerHTML
            + "</svg>";
    }


    readonly zoomOptions = [
        { value: 0.25, label: "25%" },
        { value: 0.33, label: "33%" },
        { value: 0.50, label: "50%" },
        { value: 0.67, label: "67%" },
        { value: 0.75, label: "75%" },
        { value: 0.80, label: "80%" },
        { value: 0.90, label: "90%" },
        { value: 1.00, label: "100%" },
        { value: 1.10, label: "110%" },
        { value: 1.25, label: "125%" },
        { value: 1.50, label: "150%" },
        { value: 1.75, label: "175%" },
        { value: 2.00, label: "200%" },
        { value: 2.50, label: "250%" },
        { value: 3.00, label: "300%" },
        { value: 4.00, label: "400%" }
    ];

    readonly penSizeOptions = [
        { size: 2 , fontSize: "4px" },
        { size: 4 , fontSize: "8px" },
        { size: 8 , fontSize: "12px" },
        { size: 12, fontSize: "16px" }
    ];

    readonly penColorOptions = [
        { color: "#FF0000" },
        { color: "#00FF00" },
        { color: "#0000FF" },
        { color: "#FFA500" },
        { color: "#FFFF00" }
    ];

    // ui proxy 
    parseFloat = parseFloat;
}






