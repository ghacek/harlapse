import { createSVG } from "./painter-utils";
import { Point, Vector } from "./vector";

export class PolylinePainter {

    /** SVG element representing this polyline. */
    node: Element;

    /** Array of the points defining the polyline */
    points: Point[] = [];

    /** Array of points in flat format: x1,y1,x2,y2,x3,... */
    flatPoints: number[] = [];

    /** Last added point. */
    last?: Point;

    constructor(canvas: Element) {
        this.node = createSVG("polyline", canvas);
        this.node.setAttribute("stroke", "blue");
        this.node.setAttribute("fill", "none");
    }

    addPoint(point: Point) {
        if (this.last?.x !== point.x || this.last.y !== point.y) {
            this.last = point;
            this.points.push(point);
            this.flatPoints.push(point.x);
            this.flatPoints.push(point.y);
            this.node.setAttribute("points", <any>this.flatPoints);
        }
        return this;
    }

    destroy() {
        this.node.parentElement?.removeChild(this.node);
        this.last = undefined;
        this.points = [];
        this.flatPoints = [];
    }

    simplify(tolerance = 10) {
        const points = this.points;
        const length = points.length;

        if (length < 3 && this.last) {
            if (!length) {
                this.addPoint({ x: this.last.x, y: this.last.y + 0.2 });
            }
            this.addPoint({ x: this.last.x + 0.2, y: this.last.y });

            return [...this.flatPoints];
        }

        function acceptPoint() {
            acceptedPoint = previousPoint;
            result.push(acceptedPoint);
            cache = [];
        }

        let previousPoint = points[0];
        let acceptedPoint = points[0];
        let currentPoint = points[1];
        let currentVector = Vector.fromPoints(previousPoint, currentPoint);
        let previousVector;

        let result = [points[0]];
        let cache = [];

        for (let i = 2; i < length; i++) {
            previousPoint = currentPoint;
            currentPoint = points[i];
            previousVector = currentVector;
            currentVector = Vector.fromPoints(previousPoint, currentPoint);

            if (previousVector.dot(currentVector) < 0) {
                acceptPoint();
            } else {

                let candidate = Vector.fromPoints(acceptedPoint, currentPoint);
                let lastVector = Vector.fromPoints(acceptedPoint, previousPoint)

                cache.push(lastVector);

                for (let j = 0; j < cache.length; j++) {
                    let perp = cache[j].perpendicular(candidate);

                    if (perp.magnitude > tolerance) {
                        acceptPoint();
                        break;
                    }
                }
            }
        }

        result.push(points[points.length - 1]);

        return result.reduce((path, point) => {
            path.push(point.x);
            path.push(point.y);
            return path;
        }, <number[]>[]);;
    }

    solve(data: any) {
        var size = data.length;
        var last = size - 4;    
        
        var path = `M${data[0]},${data[1]}`;
            
        for (var i = 0; i < size - 2; i +=2) {
                
          var x0 = i ? data[i - 2] : data[0];
          var y0 = i ? data[i - 1] : data[1];
          
          var x1 = data[i + 0];
          var y1 = data[i + 1];
          
          var x2 = data[i + 2];
          var y2 = data[i + 3];
          
          var x3 = i !== last ? data[i + 4] : x2;
          var y3 = i !== last ? data[i + 5] : y2;
          
          var cp1x = (-x0 + 6 * x1 + x2) / 6;
          var cp1y = (-y0 + 6 * y1 + y2) / 6;
          
          var cp2x = (x1 + 6 * x2 - x3) / 6;
          var cp2y = (y1 + 6 * y2 - y3) / 6;
                
          path += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
        }
        
        return path;
    }

    public addSimplifiedCurve(svg: SVGElement) {
        const curve = createSVG("path", svg);

        curve.setAttribute("stroke", "purple");
        curve.setAttribute("fill", "transparent");
        curve.setAttribute("d", this.solve(this.simplify(2)));
    }
}