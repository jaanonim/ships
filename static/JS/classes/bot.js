export default class Bot {
    constructor(p_gracz) {
        this.p_gracz = p_gracz
    }

    genarte_pos() {
        let pos = []
        for (let x = 0; x < this.p_gracz.size_x; x++) {
            for (let y = 0; y < this.p_gracz.size_y; y++) {
                let buffor = this.p_gracz.plansza[x][y]
                if (!buffor.hit) {
                    pos.push(buffor)
                }
            }
        }
        return pos
    }

    make_move() {
        let max_size = this.get_longest_not_sinked_ship()
        let obj

        for (let x = 0; x < this.p_gracz.size_x; x++) {
            for (let y = 0; y < this.p_gracz.size_y; y++) {
                if (this.p_gracz.plansza[x][y].hit && this.p_gracz.plansza[x][y].type === 2) {
                    let d = this.find_dir(x, y).sort(() => Math.random() - 0.5);

                    for (let i = 0; i < d.length; i++) {
                        try {
                            obj = this.p_gracz.plansza[x + d[i][0]][y + d[i][1]]
                        } catch {
                            continue
                        }
                        if (obj === undefined) {
                            continue
                        }
                        if (!obj.hit) {
                            return obj
                        }
                    }
                }
            }
        }

        let heat_map = this.get_heat_map()
        return this.get_random_pos_from_heat_map(heat_map)
    }

    find_dir(x, y) {
        let d = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ]

        for (let i = 0; i < 4; i++) {
            let obj = undefined
            try {
                obj = this.p_gracz.plansza[x + d[i][0]][y + d[i][1]]
            } catch {
                continue
            }
            if (obj === undefined) {
                continue
            }
            if (obj.hit && obj.type === 2) {
                if (i < 2) {
                    return [[1, 0], [-1, 0]]
                }
                else {
                    return [[0, 1], [0, -1]]
                }
            }
        }
        return d
    }

    get_random_pos(max_size) {
        let y, x
        if (Math.random() < 0.5) {
            x = Math.floor(Math.random() * Math.floor((this.p_gracz.size_x / max_size))) + 1
            x *= max_size
            x--

            y = Math.floor(Math.random() * this.p_gracz.size_y)
        } else {
            y = Math.floor(Math.random() * Math.floor((this.p_gracz.size_y / max_size))) + 1
            y *= max_size
            y--

            x = Math.floor(Math.random() * this.p_gracz.size_x)
        }
        return {
            x: x,
            y: y
        }
    }

    get_longest_not_sinked_ship() {
        let longest = 0
        for (let i = 0; i < this.p_gracz.ships.length; i++) {
            if (this.p_gracz.ships[i].size > longest && !this.p_gracz.ships[i].is_sinked()) {
                longest = this.p_gracz.ships[i].size
            }
        }
        return longest
    }

    get_random_pos_from_heat_map(heat_map) {
        let max = -1
        let pos_x = 0
        let pos_y = 0
        for (let x = 0; x < this.p_gracz.size_x; x++) {
            for (let y = 0; y < this.p_gracz.size_y; y++) {
                let v = heat_map[x][y]
                if (v > max || (v == max && Math.random() > 0.5)) {
                    pos_x = x
                    pos_y = y
                    max = v
                }
            }
        }
        return this.p_gracz.plansza[pos_x][pos_y]
    }

    get_heat_map() {
        let size = this.get_longest_not_sinked_ship()
        let heat_map = []
        for (let x = 0; x < this.p_gracz.size_x; x++) {
            heat_map[x] = []
            for (let y = 0; y < this.p_gracz.size_y; y++) {
                if (this.p_gracz.plansza[x][y].hit) {
                    heat_map[x][y] = 0
                    continue
                }
                let prop = size * 2
                for (let a = 0; a < size; a++) {
                    for (let b = 0; b < size; b++) {
                        if (-a + b + x > this.p_gracz.size_x - 1 || -a + b + x < 0 || this.p_gracz.plansza[-a + b + x][y].hit) {
                            prop--
                            break
                        }
                    }
                }
                for (let a = 0; a < size; a++) {
                    for (let b = 0; b < size; b++) {
                        if (-a + b + y > this.p_gracz.size_y - 1 || -a + b + y < 0 || this.p_gracz.plansza[x][-a + b + y].hit) {
                            prop--
                            break
                        }
                    }
                }
                heat_map[x][y] = prop
            }
        }
        return heat_map
    }
}