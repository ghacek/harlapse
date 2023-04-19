import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { PolylineAnnotation, PolylinePainter } from './polilyne-painter';

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

    private painter?: PolylinePainter;
    private annotations: PolylineAnnotation[] = [];

    @Input()
    public imageUrl: string = "";

    /** Original image width. */
    imageWidth = 0;

    /** Original image height. */
    imageHeight = 0;

    @ViewChild('svg')
    svgRef!: ElementRef<SVGElement>;

    @ViewChild('canvas')
    canvasEl!: ElementRef<HTMLDivElement>;

    @ViewChild('image')
    imageRef!: ElementRef<HTMLDivElement>;

    zoomLevel = 0.5;

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

    penSize = 8;

    penColor = this.penColorOptions[0].color;

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

            this.annotations.push(this.painter.createAnnotation())

            this.painter.destroy();
            this.painter = undefined;
        }
    }

    onScreenshotLoad(event: Event) {
        const img = <HTMLImageElement>event.target;

        this.imageWidth = img.naturalWidth;
        this.imageHeight = img.naturalHeight;

        this.svgRef.nativeElement.setAttribute("viewBox", "0 0 " + this.imageWidth + " " + this.imageHeight);

        this.setZoomLevel(this.zoomLevel);
        this.imageRef.nativeElement.style.display = "block";
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize(event: Event) {
        const canvasEl = this.canvasEl.nativeElement;

        console.log("kkk", canvasEl.clientWidth, canvasEl.clientHeight);
    }

    private updateCanvasSize() {
        const canvasEl = this.canvasEl.nativeElement;
    }

    setZoomLevel(zoomLevel: number) {
        this.zoomLevel = zoomLevel;
        const imageEl = this.imageRef.nativeElement;

        imageEl.style.width = (this.imageWidth * zoomLevel) + "px";
        imageEl.style.height = (this.imageHeight * zoomLevel) + "px";
    }

    setPenSize(size: number) {
        this.penSize = size;
    }

    setPenColor(color: string) {
        this.penColor = color;
    }

    

    // ui proxy 
    parseFloat = parseFloat;
}






