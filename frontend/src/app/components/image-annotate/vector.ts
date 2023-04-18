export interface Point {
    x: number,
    y: number
}

export class Vector {

    constructor(public x: number = 0, public y: number = 0) {
    }

    get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    set magnitude(m) {
        var uv = this.normalize();
        this.x = uv.x * m;
        this.y = uv.y * m;
    }

    static fromPoints(p1: Point, p2: Point) {
        return new Vector(p2.x - p1.x, p2.y - p1.y);
    }

    cross(vector: Vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    dot(vector: Vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    add(vector: Vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector: Vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar: number) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    normalize() {
        var v = new Vector();
        var m = this.magnitude;
        v.x = this.x / m;
        v.y = this.y / m;
        return v;
    }

    unit() {
        return this.divide(this.magnitude);
    }

    perp() {
        return new Vector(-this.y, this.x)
    }

    perpendicular(vector: Vector) {
        return this.subtract(this.project(vector));
    }

    project(vector: Vector) {
        var percent = this.dot(vector) / vector.dot(vector);
        return vector.multiply(percent);
    }

    reflect(axis: Vector) {
        var vdot = this.dot(axis);
        var ldot = axis.dot(axis);
        var ratio = vdot / ldot;
        var v = new Vector();
        v.x = 2 * ratio * axis.x - this.x;
        v.y = 2 * ratio * axis.y - this.y;
        return v;
    }
}