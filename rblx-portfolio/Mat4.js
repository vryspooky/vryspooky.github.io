export class Mat4 {
    // Row-Major 4x4 Matrix
    constructor(...a) {
        this.arr = a ?? [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }
    multiply(other) {
        if(other instanceof Mat4) {
            const result = new Mat4();
            for(let x_column=0;x_column<4;x_column++){
                for(let y_row=0;y_row<4;y_row++){
                    let total = 0;
                    for(let i=0;i<4;i++) total+=this.arr[4*y_row + i] * other.arr[x_column + i*4];
                    result.arr[x_column + y_row*4] = total;
                }
            }
            return result;
        }
    }
    static translation(x, y, z) {
        return new Mat4(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1,
        );
    }
    static scale(x, y, z) {
        return new Mat4(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1,
        );
    }
    static rotationX(a=0) {
        const S = Math.sin(a);
        const C = Math.cos(a);
        return new Mat4(
            1, 0, 0, 0,
            0, C,-S, 0,
            0, S, C, 0,
            0, 0, 0, 1,
        );
    }
    static rotationY(a=0) {
        const S = Math.sin(a);
        const C = Math.cos(a);
        return new Mat4(
            C, 0, S, 0,
            0, 1, 0, 0,
           -S, 0, C, 0,
            0, 0, 0, 1,
        );
    }
    static rotationZ(a=0) {
        const S = Math.sin(a);
        const C = Math.cos(a);
        return new Mat4(
            C,-S, 0, 0,
            S, C, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        );
    }
    static rotationZYX(x, y, z) {
        const rx = Mat4.rotationX(x);
        const ry = Mat4.rotationY(y);
        const rz = Mat4.rotationZ(z);
        return rx.multiply(ry.multiply(rz));
    }
    static rotationXYZ(x, y, z) {
        const rx = Mat4.rotationX(x);
        const ry = Mat4.rotationY(y);
        const rz = Mat4.rotationZ(z);
        return rz.multiply(ry.multiply(rx));
    }
    static perspective(fov,aspect,near,far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        return new Mat4(
            f/aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far+near)*nf, -1,
            0, 0, (2*far*near)*nf, 0,
        );
    }
}
