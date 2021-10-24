import Tile from "./tile.js"
import Ship from "./ship.js"
import ShipList from "./ship_list.js"

export default class Map {
    constructor(size_x, size_y, parent) {
        this.size_x = size_x
        this.size_y = size_y
        this.plansza = []
        this.game_state = 0
        this.is_hiden = true
        this.callback = () => {}
        this.ships = []
        for (let x = 0; x < size_x; x++) {
            this.plansza[x] = []
            for (let y = 0; y < size_y; y++) {
                this.plansza[x][y] = new Tile(x, y, this, parent)
            }
        }
    }

    is_end() {
        for (let i = 0; i < this.ships.length; i++) {
            if (!this.ships[i].is_sinked()) {
                return false
            }
        }
        return true
    }

    update_ships() {
        for (let i = 0; i < this.ships.length; i++) {
            for (let j = 0; j < this.ships[i].tiles.length; j++) {
                this.ships[i].tiles[j].update()
            }
        }
    }

    update_all() {
        for (let x = 0; x < size_x; x++) {
            for (let y = 0; y < size_y; y++) {
                this.plansza[x][y].update()
            }
        }
    }

    lock() {
        this.game_state = -1
    }

    play(callback) {
        this.game_state = 1
        this.callback = callback
    }

    hide(b) {
        this.is_hiden = b
    }

    random_pos() {
        return {
            x: Math.floor(Math.random() * (this.size_x)),
            y: Math.floor(Math.random() * (this.size_y))
        }
    }

    generate_map() {
        for (let i = 0; i < ShipList.ship_list.length; i++) {
            this.spawn_ship(ShipList.ship_list[i])
        }
    }

    spawn_ship(size) {
        let statek
        do {
            let pos = this.random_pos()
            statek = new Ship(pos.x, pos.y, size, Math.random() > 0.5, this)
        }
        while (!statek.is_valid())

        statek.pleace()
    }

    to_json() {

        let res = []
        for (let x = 0; x < this.size_x; x++) {
            res[x] = []
            for (let y = 0; y < this.size_y; y++) {
                res[x][y] = this.plansza[x][y].to_json()
            }
        }

        return {
            size_x: this.size_x,
            size_y: this.size_y,
            plansza: res
        }
    }

    from_json(dict) {
        this.size_x = dict.size_x
        this.size_y = dict.size_y
        for (let x = 0; x < this.size_x; x++) {
            for (let y = 0; y < this.size_y; y++) {
                this.plansza[x][y].from_json(dict.plansza[x][y])
            }
        }
    }
}