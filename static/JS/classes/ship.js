import ShipList from "./ship_list.js"

export default class Ship {
    constructor(x, y, size, rotation, map) {
        this.x = x
        this.y = y
        this.size = size
        this.rotation = rotation
        this.map = map
        this.tiles = this.get_tiles()
        this.side_tiles = []
    }

    get_tiles() {
        let tiles = []

        if (this.rotation) {
            let exeptet_x = this.map.size_x - this.size
            if (exeptet_x < this.x) {
                this.x = exeptet_x
            }

        } else {
            let exeptet_y = this.map.size_y - this.size
            if (exeptet_y < this.y) {
                this.y = exeptet_y
            }
        }

        for (let i = 0; i < this.size; i++) {
            if (this.rotation) {
                tiles.push(this.map.plansza[this.x + i][this.y])
            } else {
                tiles.push(this.map.plansza[this.x][this.y + i])

            }
        }

        return tiles

    }

    set_highlight(n) {
        for (let i = 0; i < this.tiles.length; i++) {
            const element = this.tiles[i];
            element.highlight = n
            element.update()
        }
    }

    is_valid_pos(x, y) {
        if (x >= 0 && x < this.map.size_x && y >= 0 && y < this.map.size_y) {
            return true
        }
        return false
    }

    is_valid() {
        let pq = this.get_p_q()

        for (let ys = -1; ys < pq[1]; ys++) {
            for (let xs = -1; xs < pq[0]; xs++) {
                if (!this.is_valid_pos(this.x + xs, this.y + ys)) {
                    continue
                }
                if (this.map.plansza[this.x + xs][this.y + ys].type > 1) {
                    return false
                }
            }
        }
        return true
    }

    pleace() {
        let pq = this.get_p_q()

        for (let ys = -1; ys < pq[1]; ys++) {
            for (let xs = -1; xs < pq[0]; xs++) {
                if (!this.is_valid_pos(this.x + xs, this.y + ys)) {
                    continue
                }
                let v = 2
                let tile = this.map.plansza[this.x + xs][this.y + ys]
                if (xs < 0 || ys < 0 || ys >= pq[1] - 1 || xs >= pq[0] - 1) {
                    v = 1
                    this.side_tiles.push(tile)
                }
                tile.type = v
                tile.ships.push(this)
                tile.update()
            }
        }
        this.map.ships.push(this)
    }

    get_p_q() {
        let p = 2
        let q = this.size + 1

        if (this.rotation) {
            p = this.size + 1
            q = 2
        }

        return [p, q]
    }

    is_sinked() {
        for (let i = 0; i < this.tiles.length; i++) {
            const element = this.tiles[i];
            if (!element.hit) {
                return false
            }
        }
        return true
    }

    sink() {
        for (let i = 0; i < this.side_tiles.length; i++) {
            if (!this.side_tiles[i].hit) {
                this.side_tiles[i].hit = true;
                this.side_tiles[i].update()
            }
        }
    }

    remove() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].remove_ship(this)
            this.tiles[i].update()
        }
        for (let i = 0; i < this.side_tiles.length; i++) {
            if (this.side_tiles[i].ships.length == 1) {
                this.side_tiles[i].remove_ship(this)
            }
        }
        ShipList.ship_list.push(this.size)
        ShipList.update()
        let index = this.map.ships.indexOf(this)
        this.map.ships.splice(index, 1)
    }
}