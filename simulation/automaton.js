class Automaton {
    constructor(grid_size, survive_rule, born_rule, initial_state, neighbor){
        this.grid_size = grid_size;
        this.stateVector = Array.from({ length: grid_size }, () =>
            Array.from({ length: grid_size }, () =>
                Array(grid_size).fill(0)
        ));

    
        // ------------- rules ----------------
        this.survive_rule = survive_rule;
        this.born_rule = born_rule;
        this.initial_state = initial_state;
        this.neighbor = neighbor;        
    }

    getState(){
        return this.stateVector;
    }
    getState(x, y, z){
        return this.stateVector[x][y][z];
    }

    getSize(){
        return this.grid_size;
    }

    getNeighbors(x, y, z){
        let count = 0
        for (const [dx, dy, dz] of this.neighbor) {
            const nx = (x + dx + this.grid_size) % this.grid_size;
            const ny = (y + dy + this.grid_size) % this.grid_size;
            const nz = (z + dz + this.grid_size) % this.grid_size;

            if (this.getState(nx, ny, nz) === 1) count++;
        }
        return count;
    }

    randomSphere(radius, density = 0.05) {
        const c = Math.floor(this.grid_size / 2);

        for (let x = c - radius; x <= c + radius; x++) {
            for (let y = c - radius; y <= c + radius; y++) {
                for (let z = c - radius; z <= c + radius; z++) {

                    const dx = x - c;
                    const dy = y - c;
                    const dz = z - c;

                    // inside sphere
                    if (dx*dx + dy*dy + dz*dz > radius*radius) continue;

                    // sparse randomness
                    if (Math.random() < density) {
                        this.stateVector[x][y][z] = this.initial_state;
                    }
                }
            }
        }
    }


    step() {
        const N = this.getSize();

        const newStateVector = Array.from({ length: N }, () =>
            Array.from({ length: N }, () =>
                Array(N).fill(0)
            )
        );

        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                for (let k = 0; k < N; k++) {
                    const cell = this.stateVector[i][j][k];
                    const neighbors = this.getNeighbors(i, j, k);

                    if (
                        cell === this.initial_state &&
                        this.survive_rule.includes(neighbors)
                    ) {
                        newStateVector[i][j][k] = this.initial_state;
                    }

                    else if (cell > 0) {
                        newStateVector[i][j][k] = cell - 1;
                    }

                    else if (
                        cell === 0 &&
                        this.born_rule.includes(neighbors)
                    ) {
                        newStateVector[i][j][k] = this.initial_state;
                    }
                }
            }
        }

        this.stateVector = newStateVector;
    }

}
