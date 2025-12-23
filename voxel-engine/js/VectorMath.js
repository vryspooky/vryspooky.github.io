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

function clamp(x,a,b) { return Math.min(Math.max(x,a),b); }
function lerp(a,b,t) { return a+(b-a)*t; }
function pmod(x,a) { return ((x%a)+a)%a; }
function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

export function randomConstF3(a, b, c) {
    const it = (a * 2394823549) ^ (b * 43859742850) ^ (c * 23094565234);
    return pmod(it, 10000) / 10000;
}
export function randomConstF4(a, b, c, d) {
    const it = (a * 2394823549) ^ (b * 43859742850) ^ (c * 23094565234) ^ (d * 8427824566);
    return pmod(it, 10000) / 10000;
}
export function getRandomSeed() {
    return Math.random() * 1000000
}
export class PerlinNoise2 {
    constructor() {
        this.generateGradients(8);
    }
    generateGradients(n) {
        this.gradients = [];
        for(let i=0;i<n;i++) {
            const angle = 2 * Math.PI * i/n;
            this.gradients.push(new Vec2(Math.cos(angle), Math.sin(angle)));
        }
    }
    getVector(ix, iy, seed) {
        return this.gradients[Math.floor(randomConstF3(seed, ix, iy) * this.gradients.length)];
    }
    getValue(x, y, seed) {
        const gx0 = Math.floor(x);
        const gy0 = Math.floor(y);
        const gx1 = gx0 + 1;
        const gy1 = gy0 + 1;
        const x0_fract = x - gx0;
        const y0_fract = y - gy0;
        const x1_fract = x0_fract - 1;
        const y1_fract = y0_fract - 1;
        const inwards_oo = this.getVector(gx0, gy0, seed).dot(new Vec2(x0_fract, y0_fract));
		const inwards_oO = this.getVector(gx0, gy1, seed).dot(new Vec2(x0_fract, y1_fract));
		const inwards_Oo = this.getVector(gx1, gy0, seed).dot(new Vec2(x1_fract, y0_fract));
		const inwards_OO = this.getVector(gx1, gy1, seed).dot(new Vec2(x1_fract, y1_fract));
        const xa = fade(x0_fract);
        const ya = fade(y0_fract)
		const ylerp_o = lerp(inwards_oo, inwards_oO, ya);
		const ylerp_O = lerp(inwards_Oo, inwards_OO, ya);
		const xlerp = lerp(ylerp_o, ylerp_O, xa);
		return clamp(xlerp * 0.5 + 0.5, 0, 1);
    }
}
export class PerlinNoise3 {
    constructor() {
        this.generateGradients(12);
    }
    generateGradients(n) {
        this.gradients = [];
		const goldenAngle = 3.14159 * (3.0 - Math.sqrt(5));
		for (let i=0;i<n;i++) {
			const y = 1.0 - (2.0 * i) / (n - 1);
			const radius = Math.sqrt(1.0 - y * y);
			const angle = i * goldenAngle;
			this.gradients.push(new Vec3(
				Math.cos(angle) * radius,
				y,
				Math.sin(angle) * radius,
			));
		}
    }
    getVector(ix, iy, iz, seed) {
        return this.gradients[Math.floor(randomConstF4(seed, ix, iy, iz) * this.gradients.length)];
    }
    getValue(x, y, z, seed) {
        const gx0 = Math.floor(x);
        const gy0 = Math.floor(y);
        const gz0 = Math.floor(z);
        const gx1 = gx0 + 1;
        const gy1 = gy0 + 1;
        const gz1 = gz0 + 1;
        const x0_fract = x - gx0;
        const y0_fract = y - gy0;
        const z0_fract = z - gz0;
        const x1_fract = x0_fract - 1;
        const y1_fract = y0_fract - 1;
        const z1_fract = z0_fract - 1;

        const inwards_ooo = this.getVector(gx0, gy0, gx0, seed).dot(new Vec3(x0_fract, y0_fract, z0_fract));
		const inwards_ooO = this.getVector(gx0, gy0, gz1, seed).dot(new Vec3(x0_fract, y0_fract, z1_fract));
		const inwards_oOo = this.getVector(gx0, gy1, gz0, seed).dot(new Vec3(x0_fract, y1_fract, z0_fract));
		const inwards_oOO = this.getVector(gx0, gy1, gz1, seed).dot(new Vec3(x0_fract, y1_fract, z1_fract));
        const inwards_Ooo = this.getVector(gx1, gy0, gz0, seed).dot(new Vec3(x1_fract, y0_fract, z0_fract));
		const inwards_OoO = this.getVector(gx1, gy0, gz1, seed).dot(new Vec3(x1_fract, y0_fract, z1_fract));
		const inwards_OOo = this.getVector(gx1, gy1, gz0, seed).dot(new Vec3(x1_fract, y1_fract, z0_fract));
		const inwards_OOO = this.getVector(gx1, gy1, gz1, seed).dot(new Vec3(x1_fract, y1_fract, z1_fract));
        const xa = fade(x0_fract);
        const ya = fade(y0_fract);
        const za = fade(z0_fract);
		const zlerp_oo = lerp(inwards_ooo, inwards_ooO, za);
		const zlerp_oO = lerp(inwards_oOo, inwards_oOO, za);
		const zlerp_Oo = lerp(inwards_Ooo, inwards_OoO, za);
		const zlerp_OO = lerp(inwards_OOo, inwards_OOO, za);
		const ylerp_o = lerp(zlerp_oo, zlerp_oO, ya);
		const ylerp_O = lerp(zlerp_Oo, zlerp_OO, ya);
		const xlerp = lerp(ylerp_o, ylerp_O, xa);
		return clamp(xlerp * 0.5 + 0.5, 0, 1);
    }
}
export class VoronoiNoise2 {
    constructor(seed) {
        this.seed = seed ?? getRandomSeed();
    }
    getPoint(ix, iy) {
        ix = Math.floor(ix);
        iy = Math.floor(iy);
        let point = {
            x:ix+randomConstF3(ix,iy,this.seed),
            y:iy+randomConstF3(iy,ix,this.seed),
            value:randomConstF3(this.seed,ix,iy),
        }
        return point;
    }
    get(x, y) {
        const p1 = new Vec2(x, y);
        const gx0 = Math.floor(x);
        const gy0 = Math.floor(y);
        let closest = Number.MAX_VALUE;
        let closestPoint = null;
        for(let xc=-1;xc<=1;xc++){
            const gx = gx0 + xc;
            for(let yc=-1;yc<=1;yc++){
                const gy = gy0 + yc;
                const point = this.getPoint(gx,gy);
                const dist = p1.dist(new Vec2(point.x, point.y));
                if(dist>=closest)continue;
                closest = dist;
                closestPoint = point;
            }
        }
        return {
            point: closestPoint,
            distance: closest,
        };
    }
    getValue(x, y) {
        return this.get(x, y).point.value;
    }
}
export class VoronoiNoise3 {
    constructor(seed) {
        this.seed = seed ?? getRandomSeed();
    }
    getPoint(ix, iy, iz) {
        ix = Math.floor(ix);
        iy = Math.floor(iy);
        iz = Math.floor(iz);
        let point = {
            x:ix+randomConstF4(ix,iy,iz,this.seed),
            y:iy+randomConstF4(iy,iz,ix,this.seed),
            z:iz+randomConstF4(iz,ix,iy,this.seed),
            value:randomConstF4(this.seed,ix,iy,iz),
        }
        return point;
    }
    get(x, y, z) {
        const p1 = new Vec3(x, y, z);
        const gx0 = Math.floor(x);
        const gy0 = Math.floor(y);
        const gz0 = Math.floor(z);
        let closest = Number.MAX_VALUE;
        let closestPoint = null;
        for(let xc=-1;xc<=1;xc++){
            const gx = gx0 + xc;
            for(let yc=-1;yc<=1;yc++){
                const gy = gy0 + yc;
                for(let zc=-1;zc<=1;zc++){
                    const gz = gz0 + zc;
                    const point = this.getPoint(gx,gy,gz);
                    const dist = p1.dist(new Vec3(point.x, point.y, point.z));
                    if(dist>=closest)continue;
                    closest = dist;
                    closestPoint = point;
                }
            }
        }
        return {
            point: closestPoint,
            distance: closest,
        };
    }
    getValue(x, y, z) {
        return this.get(x, y, z).point.value;
    }
}
export const PseudoRandomGlsl = `
    float randomConstF3(float a, float b, float c) {
        uint ua = uint(floor(a * 10000.0));
        uint ub = uint(floor(b * 10000.0));
        uint uc = uint(floor(c * 10000.0));
        uint it = ua * 2394823549u ^ ub * 1234567890u ^ uc * 987654321u;
        return float(it % 10000u) / 10000.0;
    }
    float randomConstF4(float a, float b, float c, float d) {
        uint ua = uint(floor(a * 10000.0));
        uint ub = uint(floor(b * 10000.0));
        uint uc = uint(floor(c * 10000.0));
        uint ud = uint(floor(d * 10000.0));
        uint it = ua * 2394823549u ^ ub * 1234567890u ^ uc * 987654321u ^ ud * 192837465u;
        return float(it % 10000u) / 10000.0;
    }
    float fade(float t) {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }
    vec2 getPerlinVector2D(vec2 pos, float seed) {
        int i = int(randomConstF3(seed, pos.x, pos.y) * 12.0);
        float angle = 6.2831853 * (float(i) / 12.0);
        return vec2(cos(angle), sin(angle));
    }
    float perlinNoise2D(vec2 pos, float seed) {
        vec2 p0 = floor(pos);
        vec2 p1 = p0 + vec2(1.0, 1.0);
        vec2 f = fract(pos);
        vec2 f1 = f - vec2(1.0, 1.0);
        vec2 f_fade = vec2(fade(f.x), fade(f.y));
        float inwards_oo = dot(getPerlinVector2D(p0, seed), f);
        float inwards_oO = dot(getPerlinVector2D(vec2(p0.x, p1.y), seed), vec2(f.x, f1.y));
        float inwards_Oo = dot(getPerlinVector2D(vec2(p1.x, p0.y), seed), vec2(f1.x, f.y));
        float inwards_OO = dot(getPerlinVector2D(p1, seed), f1);
        float ylerp_o = mix(inwards_oo, inwards_oO, f_fade.y);
        float ylerp_O = mix(inwards_Oo, inwards_OO, f_fade.y);
        float xlerp = mix(ylerp_o, ylerp_O, f_fade.x);
        return clamp(xlerp * 0.5 + 0.5, 0.0, 1.0);
    }
    vec3 getPerlinVector3D(vec3 pos, float seed) {
        int i = int(randomConstF4(seed, pos.x, pos.y, pos.z) * 12.0);
        float goldenAngle = 3.14159 * (3.0 - sqrt(5.0));
        float y = 1.0 - (2.0 * float(i)) / 11.0;
        float radius = sqrt(1.0 - y * y);
        float angle = float(i) * goldenAngle;
        return vec3(cos(angle) * radius, y, sin(angle) * radius);
    }
    float perlinNoise3D(vec3 pos, float seed) {
        vec3 p0 = floor(pos);
        vec3 p1 = p0 + vec3(1.0, 1.0, 1.0);
        vec3 f = fract(pos);
        vec3 f1 = f - vec3(1.0, 1.0, 1.0);
        vec3 f_fade = vec3(fade(f.x), fade(f.y), fade(f.z));
        float inwards_ooo = dot(getPerlinVector3D(p0, seed), f);
        float inwards_ooO = dot(getPerlinVector3D(vec3(p0.x, p0.y, p1.z), seed), vec3(f.x, f.y, f1.z));
        float inwards_oOo = dot(getPerlinVector3D(vec3(p0.x, p1.y, p0.z), seed), vec3(f.x, f1.y, f.z));
        float inwards_oOO = dot(getPerlinVector3D(vec3(p0.x, p1.y, p1.z), seed), vec3(f.x, f1.y, f1.z));
        float inwards_Ooo = dot(getPerlinVector3D(vec3(p1.x, p0.y, p0.z), seed), vec3(f1.x, f.y, f.z));
        float inwards_OoO = dot(getPerlinVector3D(vec3(p1.x, p0.y, p1.z), seed), vec3(f1.x, f.y, f1.z));
        float inwards_OOo = dot(getPerlinVector3D(vec3(p1.x, p1.y, p0.z), seed), vec3(f1.x, f1.y, f.z));
        float inwards_OOO = dot(getPerlinVector3D(p1, seed), f1);
        float zlerp_oo = mix(inwards_ooo, inwards_ooO, f_fade.z);
        float zlerp_oO = mix(inwards_oOo, inwards_oOO, f_fade.z);
        float zlerp_Oo = mix(inwards_Ooo, inwards_OoO, f_fade.z);
        float zlerp_OO = mix(inwards_OOo, inwards_OOO, f_fade.z);
        float ylerp_o = mix(zlerp_oo, zlerp_oO, f_fade.y);
        float ylerp_O = mix(zlerp_Oo, zlerp_OO, f_fade.y);
        float xlerp = mix(ylerp_o, ylerp_O, f_fade.x);
        return clamp(xlerp * 0.5 + 0.5, 0.0, 1.0);
    }
    float voronoiNoise2D(vec2 pos, float seed) {
        vec2 p0 = floor(pos);
        float closest = 1.0 / 0.0;
        float closestValue = 0.0;
        for(int xc=-1;xc<=1;xc++){
            float gx = p0.x + float(xc);
            for(int yc=-1;yc<=1;yc++){
                float gy = p0.y + float(yc);
                vec2 point = vec2(gx + randomConstF3(gx, gy, seed), gy + randomConstF3(gy, gx, seed));
                float dist = distance(pos, point);
                if(dist>=closest)continue;
                closest = dist;
                closestValue = randomConstF3(seed, gx, gy);
            }
        }
        return closestValue;
    }
    float voronoiNoise3D(vec3 pos, float seed) {
        vec3 p0 = floor(pos);
        float closest = 1.0 / 0.0;
        float closestValue = 0.0;
        for(int xc=-1;xc<=1;xc++){
            float gx = p0.x + float(xc);
            for(int yc=-1;yc<=1;yc++){
                float gy = p0.y + float(yc);
                for(int zc=-1;zc<=1;zc++){
                    float gz = p0.z + float(zc);
                    vec3 point = vec3(gx + randomConstF4(gx, gy, gz, seed), gy + randomConstF4(gy, gz, gx, seed), gz + randomConstF4(gz, gx, gy, seed));
                    float dist = distance(pos, point);
                    if(dist>=closest)continue;
                    closest = dist;
                    closestValue = randomConstF4(seed, gx, gy, gz);
                }
            }
        }
        return closestValue;
    }
`;
