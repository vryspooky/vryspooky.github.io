import { Vec3 } from "./Vec3.js";
import { Vec2 } from "./Vec2.js";
import { Mat4 } from "./Mat4.js";

// made by sllenderbrine

export class Camera {
    constructor(width=16, height=9, fovx=Math.PI/4) {
        this.position = new Vec3();
        this.rotation = new Vec3();
        this.setAspectRatio(width, height);
        this.setHorizontalFov(fovx);
        this.updateTranslationMatrix();
        this.updateRotationMatrix();
        this.updateProjectionMatrix();
    }
    setAspectRatio(width, height) {
        this.aspect = width / height;
        this.setHorizontalFov(this.fovx);
    }
    setHorizontalFov(angle) {
        this.fovx = angle;
        this.fovy = 2 * Math.atan(Math.tan(this.fovx / 2) / this.aspect);
    }
    updateTranslationMatrix() {
        this.translationMatrix = Mat4.translation(-this.position.x, -this.position.y, -this.position.z);
    }
    updateRotationMatrix() {
        this.rotationMatrix = Mat4.rotationZYX(-this.rotation.x, -this.rotation.y, -this.rotation.z);
    }
    updateProjectionMatrix() {
        this.projectionMatrix = Mat4.perspective(this.fovx, this.aspect, 1, 1000);
    }
    worldToScreenPoint(position) {
        const clip = position.clone().subtract(this.position).rotateZYX(-this.rotation.x, -this.rotation.y, -this.rotation.z);
        if(clip.z <= 0) return;
        return new Vec3(
            1/Math.tan(this.fovx/2) * clip.x / - clip.z,
            1/Math.tan(this.fovy/2) * clip.y / - clip.z,
            clip.z
        );
    }
}
