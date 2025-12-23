import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';


let automata = new Automata();
let instancedMesh;
const dummy = new THREE.Object3D(); // Helper to calculate matrices
const colorHelper = new THREE.Color();

// -------------------- PARAMETERS --------------------
const wire_size = 1.3;
let playing = false;
let frameCount = 0;
const frameSkip = 5; 
const w = window.innerWidth;
const h = window.innerHeight;
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;

// -------------- Setup ------------------------------
function parseRule(str) {
    const result = [];

    for (const token of str.split(/[,\s]+/)) {
        if (token.includes("-")) {
            const [a, b] = token.split("-").map(Number);
            for (let i = a; i <= b; i++) result.push(i);
        } else {
            result.push(Number(token));
        }
    }

    return result;
}

function vonNeumann3D() {
    return [
        [ 1,  0,  0], [-1,  0,  0],
        [ 0,  1,  0], [ 0, -1,  0],
        [ 0,  0,  1], [ 0,  0, -1],
    ];
}
function moore3D(r = 1) {
    const n = [];
    for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dz = -r; dz <= r; dz++) {
                if (dx || dy || dz) n.push([dx, dy, dz]);
            }
        }
    }
    return n;
}

// -------------------- SCENE SETUP --------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;


const renderer = new THREE.WebGLRenderer({
    antialias: false,
    canvas: document.getElementById('canvas'),
});
renderer.setSize(w, h);


// -------------------- WIREFRAME --------------------
const geometry = new THREE.BoxGeometry(wire_size, wire_size, wire_size);
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const wireframeCube = new THREE.LineSegments(edges, lineMaterial);
scene.add(wireframeCube);

window.generate = async () => {
    const N = parseInt(document.getElementById("grid").value);
    const sRule = parseRule(document.getElementById("survive").value);
    const bRule = parseRule(document.getElementById("birth").value);
    const decay = parseInt(document.getElementById("decay").value);
    const neighbors = (document.getElementById("neighborhood").value === "m") ? moore3D() : vonNeumann3D();

    automata.init(N, sRule, bRule, decay, neighbors);

    if (instancedMesh) wireframeCube.remove(instancedMesh);

    const cell_size = wire_size / N;
    const geometry = new THREE.BoxGeometry(cell_size, cell_size, cell_size);
    const material = new THREE.MeshBasicMaterial();
    
    instancedMesh = new THREE.InstancedMesh(geometry, material, N * N * N);
    wireframeCube.add(instancedMesh);
    
    updateVisuals();
};

window.play = () =>{
    playing = true;
}
window.stop = () =>{
    playing = false;
}

function updateVisuals() {
    const N = automata.gridSize;
    const cell_size = wire_size / N;
    const offset = wire_size / 2;
    let idx = 0;

    for (let z = 0; z < N; z++) {
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                const state = automata.currentState[idx];
                
                if (state > 0) {
                    dummy.position.set(x * cell_size - offset, y * cell_size - offset, z * cell_size - offset);
                    dummy.scale.set(1, 1, 1); 
                    
                    const hue = (state / automata.initialState) * 0.1 + 0.5;
                    colorHelper.setHSL(hue, 0.8, 0.5);
                    instancedMesh.setColorAt(idx, colorHelper);
                } else {
                    dummy.scale.set(0, 0, 0);
                }
                
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(idx, dummy.matrix);
                idx++;
            }
        }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
}

// -------------------- MAIN LOOP --------------------
function animate() {
    requestAnimationFrame(animate);
    
    if (playing) {
        automata.step();
        updateVisuals();
    }
    wireframeCube.rotation.y += 0.001; 

    renderer.render(scene, camera);
}
animate()