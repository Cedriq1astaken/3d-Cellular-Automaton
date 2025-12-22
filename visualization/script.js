import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';




// Rules
function* range(start, end, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}

function xyzToRGB(x, y, z, grid_size) {
    const r = (x + grid_size) / (2 * grid_size); // 0 → 1
    const g = (y + grid_size) / (2 * grid_size); // 0 → 1
    const b = (z + grid_size) / (2 * grid_size); // 0 → 1
    return new THREE.Color(r, g, b);
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
// -------------------- PARAMETERS --------------------
let frameCount = 0;
const frameSkip = 5; 
const w = window.innerWidth;
const h = window.innerHeight;
const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 10;

const automaton = new Automaton(25, [...range(9, 26)], [...range(5, 7), ...range(12, 13), 15], 2, moore3D()); 
automaton.randomSphere(8, 0.3)
const grid_size = Math.floor(automaton.getSize() / 2);
const full_grid = grid_size * 2;
const wire_size = 1.3;
const cell_size = wire_size / full_grid; 

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

// -------------------- PERSISTENT CUBES --------------------
const cubes = []; 

for (let i = -grid_size; i < grid_size; i++) {
    for (let j = -grid_size; j < grid_size; j++) {
        for (let k = -grid_size; k < grid_size; k++) {
            const geo = new THREE.BoxGeometry(cell_size, cell_size, cell_size);
            const mat = new THREE.MeshBasicMaterial({ color: 0xff0011});
            const cube = new THREE.Mesh(geo, mat.clone());

            const edge = new THREE.EdgesGeometry(geo);
            const wire = new THREE.LineBasicMaterial({ color: 0xffffff });
            const wireCube = new THREE.LineSegments(edge, wire);
            cube.add(wireCube);

            cube.position.x = (i + grid_size + 0.5) * cell_size - wire_size / 2;
            cube.position.y = (j + grid_size + 0.5) * cell_size - wire_size / 2;
            cube.position.z = (k + grid_size + 0.5) * cell_size - wire_size / 2;

            cube.visible = false; 
            wireframeCube.add(cube);
            cubes.push({ cube, i, j, k });
        }
    }
}

// -------------------- SIMULATION --------------------
function simulate() {
    automaton.step()
    cubes.forEach(({cube, i, j, k }) => {
        let s = automaton.getState(i + grid_size, j + grid_size, k + grid_size);
        if (s === 0) {
            cube.visible = false;
            return;
        }
       cube.visible = true;

        const rgbColor = xyzToRGB(i, j, k, grid_size);


        const t = Math.min(s / automaton.initial_state, 1);
        rgbColor.multiplyScalar(0.3 + 0.7 * t); 

        cube.material.color.copy(rgbColor);
    });
}

// -------------------- ANIMATION --------------------

function animate() {
    requestAnimationFrame(animate);
    frameCount++;
    if (frameCount % frameSkip === 0) {
        wireframeCube.rotation.y += 0.001; 
        simulate();
    }

    renderer.render(scene, camera);
}
animate();
