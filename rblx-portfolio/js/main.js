import { Vec3 } from "./Vec3.js";
import { Camera } from "./Camera.js";

const canvas = document.querySelector("#background-canvas");
const ctx = canvas.getContext('2d');
const camera = new Camera();
let mouseX = 0;
let mouseY = 0;
let mousePanX = 0;
let mousePanY = 0;
let mousePanXL = 0;
let mousePanYL = 0;
let lastFrameTime = performance.now();
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.setAspectRatio(canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mousePanX = (e.clientX / window.innerWidth - 0.5) * 2;
    mousePanY = (e.clientY / window.innerHeight - 0.5) * -2;
});

const dots = [];
const colors = [];
for(let i=0;i<1000;i++) {
    dots.push(new Vec3(0,0,1).rotateXYZ(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2).multiply(Math.random()**0.5*5));
    const rand = Math.random();
    const red = new Vec3(255,0,0);
    const green = new Vec3(70,205,100);
    const white = new Vec3(255,255,255);
    if(rand > 0.5) {
        const color = red.clone().lerp(white, (rand-0.5)/0.5);
        colors.push(`rgb(${color.x},${color.y},${color.z})`);
    } else {
        const color = green.clone().lerp(white, (rand)/0.5);
        colors.push(`rgb(${color.x},${color.y},${color.z})`)
    }
}
const nameLabel = document.querySelector(".name-label");
const nameLabelBG = document.querySelector(".name-label-bg");
let hoveringNameLabel = false;

function isHoveringNameLabel() {
    const labelRect = nameLabel.getBoundingClientRect();
    return (mouseX > labelRect.left && mouseX < labelRect.left+labelRect.width && mouseY > labelRect.top && mouseY < labelRect.top+labelRect.height)
}

window.addEventListener('mousedown', () => {
    if(isHoveringNameLabel()) {
        window.scrollTo({ top: window.innerHeight*0.9, behavior: 'smooth' });
    }
});

function render() {
    const now = performance.now();
    const deltaTime = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    mousePanXL += (mousePanX - mousePanXL) * deltaTime * 3;
    mousePanYL += (mousePanY + 2 * window.scrollY / window.innerHeight - mousePanYL) * deltaTime * 3;
    canvas.style.top = `${window.scrollY*0.5}px`;
    camera.rotation.y = performance.now() / 10000 - mousePanXL * 0.5;
    camera.rotation.x = Math.sin(performance.now() / 5000) * 0.3 + mousePanYL * 0.5;
    camera.position = new Vec3().subtract(new Vec3(0,0,1).rotateXYZ(...camera.rotation.toArray()).multiply(7));
    
    if(window.scrollY < window.innerHeight) {
        ctx.fillStyle = "white";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach((dot, i) => {
            const screenPoint = camera.worldToScreenPoint(dot);
            if(screenPoint) {
                const x = (screenPoint.x + 1) / 2 * canvas.width;
                const y = (1 - (screenPoint.y + 1) / 2) * canvas.height;
                const size = Math.min(window.innerWidth, window.innerHeight) / 150 / screenPoint.z;
                ctx.fillStyle = colors[i];
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI*2);
                ctx.fill();
                ctx.closePath();
            }
        });
    }

    let lastHoveringNameLabel = hoveringNameLabel;
    hoveringNameLabel = isHoveringNameLabel();
    if(hoveringNameLabel && !lastHoveringNameLabel) {
        nameLabel.style.zIndex = 1;
        nameLabelBG.style.zIndex = 2;
        nameLabelBG.style.color = "white";
        nameLabelBG.style.textShadow = "none";
        nameLabelBG.animate([
            { opacity:0 },
            { opacity:1 },
        ],{ duration: 100, easing: "ease", fill: "forwards" });
        nameLabel.animate([
            { textShadow: "-0.4vmin -0.4vmin rgb(209, 50, 45), 0.4vmin 0.4vmin rgb(56, 147, 77)" },
            { textShadow: "-1vmin -0.4vmin rgb(209, 50, 45), 1vmin 0.4vmin rgb(56, 147, 77)" },
        ],{ duration: 100, easing: "ease", fill: "forwards" });
    } else if(!hoveringNameLabel && lastHoveringNameLabel) {
        nameLabel.style.zIndex = 2;
        nameLabelBG.style.zIndex = 1;
        nameLabelBG.style.color="rgb(20,21,22)";
        nameLabelBG.style.textShadow = "-0.4vmin -0.4vmin rgb(20,21,22), 0.4vmin 0.4vmin rgb(20,21,22)";
        nameLabel.animate([
            { textShadow: "-1vmin -0.4vmin rgb(209, 50, 45), 1vmin 0.4vmin rgb(56, 147, 77)" },
            { textShadow: "-0.4vmin -0.4vmin rgb(209, 50, 45), 0.4vmin 0.4vmin rgb(56, 147, 77)" },
        ],{ duration: 100, easing: "ease", fill: "forwards" });
    }

    requestAnimationFrame(render);
}
render();
