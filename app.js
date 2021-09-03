function SimplexTable(unbase, base, table, freeElements, coeffs, width, height) {
    (function () {
        this.unbase = unbase;
        this.base = base;
        this.width = width + 1;
        this.height = height + 1;
        this.table = [];
        for (let i = 0; i < this.height - 1; i++) {
            for (let j = 0; j < this.width - 1; j++) {
                this.table[i * this.width + j] = table[i * (this.width - 1) + j];
            }
            this.table[i * this.width + (this.width - 1)] = freeElements[i];
        }
        for (let i = 0; i < this.width - 1; i++) {
            this.table[(this.height - 1) * this.width + i] = coeffs[i];
        }
        this.table[(this.height - 1) * this.width + (this.width - 1)] = 0;

    }).apply(this);

    this.findResolvedFreeElement = function () {
        let resolved = {};
        resolved.row = -1;
        for (let i = 0; i < this.height - 1; i++) {
            const el = i * this.width + this.width - 1;
            if ((this.table[el] < 0) && ((resolved.row == -1) || (this.table[el] < this.table[resolved.row * this.width + this.width - 1]))) {
                resolved.row = i;
            }
        }
        resolved.col = -1;
        if (resolved.row == -1) {
            return resolved;
        }
        for (let i = 0; i < this.width - 1; i++) {
            const el = resolved.row * this.width + i;
            if ((this.table[el] < 0) && ((resolved.col == -1) || (this.table[el] < this.table[resolved.row * this.width + resolved.col]))) {
                resolved.col = i;
            }
        }
        return resolved;
    }

    this.findResolvedCoeffElement = function () {
        let resolved = {};
        resolved.col = -1;
        for (let i = 0; i < this.width - 1; i++) {
            el = (this.height - 1) * this.width + i;
            if ((this.table[el] < 0) && ((resolved.col == -1) || (this.table[el] < this.table[(this.height - 1) * this.width + resolved.col]))) {
                resolved.col = i;
            }
        }
        resolved.row = -1;
        if (resolved.col == -1) {
            return resolved;
        }
        for (let i = 0; i < this.height - 1; i++) {
            const last = this.width - 1;
            const rowI = i * this.width;
            changedRowEl = resolved.row * this.width;
            if (this.table[rowI + resolved.col] > 0) {
                if ((resolved.row == -1) || (this.table[rowI + last] / this.table[rowI + resolved.col] < this.table[changedRowEl + last] / this.table[changedRowEl + resolved.col])) {
                    resolved.row = i;
                }
            }
        }
        return resolved;
    }

    this.findResolvedElement = function () {
        let el = this.findResolvedFreeElement();
        if (el.col == -1) {
            el = this.findResolvedCoeffElement();
            return el;
        }
        return el;
    }

    this.resolveElement = function (resolved) {
        let table = [];
        let full = [];
        for (let i = 0; i < this.width * this.height; i++) {
            full[i] = false;
        }

        for (let i = 0; i < this.width; i++) {
            if (i != resolved.col) {
                table[resolved.row * this.width + i] = this.table[resolved.row * this.width + i] / this.table[resolved.row * this.width + resolved.col];
                full[resolved.row * this.width + i] = true;
            }
        }

        for (let i = 0; i < this.height; i++) {
            if (i != resolved.row) {
                table[i * this.width + resolved.col] = -this.table[i * this.width + resolved.col] / this.table[resolved.row * this.width + resolved.col];
                full[i * this.width + resolved.col] = true;
            }
        }
        table[resolved.row * this.width + resolved.col] = 1 / this.table[resolved.row * this.width + resolved.col];
        full[resolved.row * this.width + resolved.col] = true;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (!full[i * this.width + j]) {
                    const NMelement = this.table[resolved.row * this.width + resolved.col];
                    const IJelement = this.table[i * this.width + j];
                    const NJelement = this.table[resolved.row * this.width + j];
                    const IMelement = this.table[i * this.width + resolved.col];
                    table[i * this.width + j] = (NMelement * IJelement - NJelement * IMelement) / NMelement;
                }
            }
        }
        const tmp = this.unbase[resolved.col];
        this.unbase[resolved.col] = this.base[resolved.row];
        this.base[resolved.row] = tmp;
        this.table = table;
    }

    this.iteration = function () {
        const el = this.findResolvedElement();

        if ((el.col == -1) || (el.row == -1)) return false;
        this.resolveElement(el);

        console.log(this.toString());

        return true;
    }

    this.solve = function () {
        console.log(this.toString());
        while (this.iteration());
    }

    this.toString = function () {
        str = '\t';
        for (let i = 0; i < this.width - 1; i++) {
            str += `${this.unbase[i]}\t`;
        }
        str += '\n';

        for (let i = 0; i < this.height; i++) {
            if (i < this.height - 1) {
                str += `${this.base[i]}\t`;
            } else {
                str += 'f\t';
            }
            for (let j = 0; j < this.width; j++) {
                str += `${Math.round(this.table[i * this.width + j] * 10000) / 10000.0}\t`;
            }

            str += '\n';
        }
        return str + '\n';
    }
}


const p1 = 'x1', p2 = 'x2', p3 = 'x3', p4 = 'x4', p5 = 'x5';

const unbase = [p1, p2];
const base = [p3, p4, p5];
const table = [-4, -1, -2, -3, -1, -7];
const freeElements = [-11, -13, -12];
const coeffs = [7, 1];

let simplex = new SimplexTable(unbase, base, table, freeElements, coeffs, 2, 3);
simplex.solve();