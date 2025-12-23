class Automata {
    constructor() {
        this.gridSize = 0;
        this.surviveRule = [];
        this.bornRule = [];
        this.initialState = 0;
        this.neighbors = [];
        this.currentState = null;
        this.nextState = null;
    }

    init(gridSize, surviveRule, bornRule, initialState, neighbors) {
        this.gridSize = gridSize;
        this.surviveRule = new Set(surviveRule); 
        this.bornRule = new Set(bornRule);
        this.initialState = initialState;
        this.neighbors = neighbors;

        const totalCells = gridSize * gridSize * gridSize;
        this.currentState = new Uint8Array(totalCells);
        this.nextState = new Uint8Array(totalCells);

        this.seedRandomSphere(Math.floor(this.gridSize / 64));
    }

    seedRandomSphere(radius, density = 0.1) {
        const N = this.gridSize;
        const center = Math.floor(N / 2);
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                for (let z = 0; z < N; z++) {
                    const dx = x - center;
                    const dy = y - center;
                    const dz = z - center;
                    if (dx * dx + dy * dy + dz * dz <= radius * radius) {
                        if (Math.random() < density) {
                            const idx = x + (y * N) + (z * N * N);
                            this.currentState[idx] = this.initialState;
                        }
                    }
                }
            }
        }
    }

    getNeighborCount(x, y, z) {
        let count = 0;
        const N = this.gridSize;
        for (const [dx, dy, dz] of this.neighbors) {
            const nx = (x + dx + N) % N;
            const ny = (y + dy + N) % N;
            const nz = (z + dz + N) % N;
            const idx = nx + (ny * N) + (nz * N * N);
            if (this.currentState[idx] === this.initialState) count++;
        }
        return count;
    }

    step() {
        const N = this.gridSize;
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                for (let z = 0; z < N; z++) {
                    const idx = x + (y * N) + (z * N * N);
                    const cell = this.currentState[idx];
                    const neighbors = this.getNeighborCount(x, y, z);

                    if (cell === this.initialState) {
                        this.nextState[idx] = this.surviveRule.has(neighbors) ? this.initialState : cell - 1;
                    } else if (cell > 0) {
                        this.nextState[idx] = cell - 1;
                    } else if (cell === 0 && this.bornRule.has(neighbors)) {
                        this.nextState[idx] = this.initialState;
                    } else {
                        this.nextState[idx] = 0;
                    }
                }
            }
        }
        [this.currentState, this.nextState] = [this.nextState, this.currentState];
    }
}