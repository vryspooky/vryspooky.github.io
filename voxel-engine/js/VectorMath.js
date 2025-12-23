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
    map(method=Math.floor) {
        this.x = method(this.x);
        this.y = method(this.y);
        return this;
    }
    toArray() {
        return [this.x,this.y];
    }
    toString() {
        return `<${this.x}, ${this.y}>`;
    }
}


export class Vec3 {
    constructor(x,y,z) {
        x = x ?? 0;
        if(x instanceof Vec3) {
            this.x=x.x;
            this.y=x.y;
            this.z=x.z;
        } else if(y==null) {
            this.x=x;
            this.y=x;
            this.z=x;
        } else {
            this.x=x;
            this.y=y;
            this.z=z;
        }
    }
    clone() {
        return new Vec3(this);
    }
    add(other) {
        this.x+=other.x;
        this.y+=other.y;
        this.z+=other.z;
        return this;
    }
    subtract(other) {
        this.x-=other.x;
        this.y-=other.y;
        this.z-=other.z;
        return this;
    }
    multiply(scale) {
        this.x*=scale;
        this.y*=scale;
        this.z*=scale;
        return this;
    }
    divide(scale) {
        this.x/=scale;
        this.y/=scale;
        this.z/=scale;
        return this;
    }
    dot(other) {
        return this.x*other.x + this.y*other.y + this.z*other.z
    }
    cross(other) {
        return new Vec3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        ); 
    }
    equals(other) {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    }
    magnitudeSquared() {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }
    magnitude() {
        return Math.sqrt(this.magnitudeSquared());
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
    flatten() {
        this.y = 0;
        return this;
    }
    rotateX(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const temp = this.y;
        this.y = this.y*cosAngle - this.z*sinAngle;
        this.z = temp*sinAngle + this.z*cosAngle;
        return this;
    }
    rotateY(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const temp = this.x;
        this.x = this.x*cosAngle + this.z*sinAngle;
        this.z = this.z*cosAngle - temp*sinAngle;
        return this;
    }
    rotateZ(angle) {
        const sinAngle = Math.sin(angle);
        const cosAngle = Math.cos(angle);
        const temp = this.x;
        this.x = this.x*cosAngle - this.y*sinAngle;
        this.y = temp*sinAngle + this.y*cosAngle;
        return this;
    }
    rotateXYZ(x,y,z) {
        if(x instanceof Vec3) { [x,y,z] = x.toArray(); }
        return this.rotateX(x).rotateY(y).rotateZ(z);
    }
    rotateZYX(x,y,z) {
        if(x instanceof Vec3) { [x,y,z] = x.toArray(); }
        return this.rotateZ(z).rotateY(y).rotateX(x);
    }
    map(method=Math.floor) {
        this.x = method(this.x);
        this.y = method(this.y);
        this.z = method(this.z);
        return this;
    }
    toArray() {
        return [this.x,this.y,this.z];
    }
    toString() {
        return `<${this.x}, ${this.y}, ${this.z}>`;
    }
}
