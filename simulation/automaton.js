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
        for(const [dx, dy, dz] of this.neighbor){
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;

            if (nx < 0 || nx >= this.grid_size) continue;
            if (ny < 0 || ny >= this.grid_size) continue;
            if (nz < 0 || nz >= this.grid_size) continue;

            if (this.getState(nx, ny, nz) === 1) count++;
        }
        return count;
    }

    random(n){
        for(let i = 0; i < n; i++){
            let x = Math.floor(Math.random() * (this.grid_size - 1));
            let y = Math.floor(Math.random() * (this.grid_size - 1));
            let z = Math.floor(Math.random() * (this.grid_size - 1));
            this.stateVector[x][y][z] = this.initial_state;
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
