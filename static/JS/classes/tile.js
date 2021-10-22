import ShipList from "./ship_list.js"
import Ship from "./ship.js"

export default class Tile {
    constructor(x, y, map, parent) {
        this.hit = false
        this.x = x
        this.y = y
        this.type = 0
        this.highlight = 0
        this.map = map
        this.create_element(parent)
        this.ships = []
    }

    create_element(parent) {
        this.html_element = document.createElement("DIV")
        this.html_element.classList.add("element")
        this.update()
        parent.appendChild(this.html_element)

        let t = this

        this.html_element.onmouseenter = function () {
            if (t.map.game_state == 0) {
                if (ShipList.ship_len > -1) {
                    let statek = new Ship(t.x, t.y, ShipList.ship_len, ShipList.rotation, t.map)
                    statek.set_highlight(statek.is_valid() ? 1 : -1)
                }
            }
        }
        this.html_element.onmouseleave = function () {
            if (t.map.game_state == 0) {
                if (ShipList.ship_len > -1) {
                    new Ship(t.x, t.y, ShipList.ship_len, ShipList.rotation, t.map).set_highlight(0)
                }
            }
        }
        this.html_element.oncontextmenu = function (event) {
            if (t.map.game_state == 0) {
                event.preventDefault()
                if (ShipList.ship_len > -1) {
                    new Ship(t.x, t.y, ShipList.ship_len, ShipList.rotation, t.map).set_highlight(0)
                }
                ShipList.rotation = !ShipList.rotation
                if (ShipList.ship_len > -1) {
                    let statek = new Ship(t.x, t.y, ShipList.ship_len, ShipList.rotation, t.map)
                    statek.set_highlight(statek.is_valid() ? 1 : -1)
                }
            }
        }
        this.html_element.onclick = function () {
            if (t.map.game_state == 0) {
                if (t.type == 2) {
                    if (t.ships.length != 1) {
                        console.error("To nie powinn sie stać")
                    }

                    t.ships[0].remove()
                    ShipList.callback()
                }
                if (ShipList.ship_len > -1) {
                    let statek = new Ship(t.x, t.y, ShipList.ship_len, ShipList.rotation, t.map)
                    if (statek.is_valid()) {
                        statek.pleace()
                        statek.set_highlight(0)

                        ShipList.ship_pleaced()
                    }
                }
            } else if (t.map.game_state == 1) {
                t.shoot()
            }
        }

    }

    shoot() {
        if (this.hit) {
            return
        }
        this.hit = true
        this.update()
        this.map.callback(this)
    }

    update() {
        this._reset_classes()
        if (this.hit) {
            if (this.type === 2) {
                this.html_element.classList.add("hit")
            } else {
                this.html_element.classList.add("miss")
            }
        }

        if (this.highlight === 1) {
            this.html_element.classList.add("gost_ok")
        } else if (this.highlight === -1) {
            this.html_element.classList.add("gost_nope")
        } else if (this.type === 2 && !this.map.is_hiden) {
            this.html_element.classList.add("statek")
        }

        //this.html_element.innerText = this.type + " (" + this.x + "," + this.y + ")"
    }

    _reset_classes() {
        this.html_element.classList.remove("hit")
        this.html_element.classList.remove("miss")
        this.html_element.classList.remove("gost_ok")
        this.html_element.classList.remove("gost_nope")
        this.html_element.classList.remove("statek")
    }

    check_for_sink() {
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].is_sinked()) {
                this.ships[i].sink()
            }

        }
    }

    remove_ship(ship) {
        this.type = 0
        let index = this.ships.indexOf(this)
        this.ships.splice(index, 1)
    }


}