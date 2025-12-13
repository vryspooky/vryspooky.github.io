export class Vec2 {
    constructor(x,y) {
        x = x ?? 0;
        if(x instanceof Vec2) {
            this.x=x.x;
            this.y=x.y;
        } else if(y==null) {
            this.x=x;
            this.y=x;
        } else {
            this.x=x;
            this.y=y;
        }
    }
    add(other) {
        this.x+=other.x;
        this.y+=other.y;
        return this;
    }
    subtract(other) {
        this.x-=other.x;
        this.y-=other.y;
        return this;
    }
    multiply(scale) {
        this.x*=scale;
        this.y*=scale;
        return this;
    }
    divide(scale) {
        this.x/=scale;
        this.y/=scale;
        return this;
    }
    dot(other) {
        return this.x*other.x + this.y*other.y;
    }
    magnitude() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
    normalize() {
        const mag = this.magnitude();
        if(mag==0) { return this; }
        this.divide(mag);
        return this;
    }
    dist(other) {
        return this.clone().subtract(other).magnitude();
    }
    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
    rotate(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const temp = this.x;
        this.x = this.x*cosAngle + this.y*sinAngle;
        this.y = this.y*cosAngle - temp*sinAngle;
        return this;
    }
    toArray() {
        return [this.x,this.y];
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
}
