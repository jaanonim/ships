/* 
    Type:

    0 - empty
    1 - taken
    2 - ship

*/

/*
    Highlight:

    -1 - highlight bad pos
    0 - no highlight
    1 - highlight good pos

*/

/*

    Rotacja:
    
    true - poziomo (x)
    false - pionowo (y)

 */

/*

    Game State:

    0 - pleaceble
    -1 - lock
    1 - playable

*/

import ShipList from "./ship_list.js"
import Map from "./map.js"
import Bot from "./bot.js"
import Socket from "./socket.js"

export default class GameManager {
    constructor(ships, size_x, size_y) {
        this.controls = document.getElementById("controls")
        this.gracz_div = document.getElementById("gracz")
        this.bot_div = document.getElementById("bot")
        this.ships = ships
        this.size_x = size_x
        this.size_y = size_y

        this.init()
    }

    init() {
        this.gracz_div.innerText = ""
        this.bot_div.innerText = ""
        this.controls.innerText = ""
        document.documentElement.style.setProperty('--x_size', this.size_x);
        document.documentElement.style.setProperty('--y_size', this.size_y);


        new ShipList(this.ships, () => {
            this.ship_pleaced()
        })

        this.p_gracz = new Map(this.size_x, this.size_y, this.gracz_div)
        this.p_gracz.generate_map()
        this.p_gracz.hide(false)
        this.p_gracz.update_ships()

        /*this.p_bot = new Map(this.size_x, this.size_y, this.bot_div)
        this.p_bot.generate_map()
        this.p_bot.lock()*/

        ShipList.selected_id = -1
        ShipList.ship_list = []
        ShipList.update()

        this.bot = new Bot(this.p_gracz)
        this.bot2 = new Bot(this.p_bot)
        this.player = 0

        this.ship_pleaced()
    }

    createButton(title, callback) {
        let button = document.createElement("button")
        button.classList.add("button")
        button.innerText = title
        button.onclick = () => {
            callback()
        }
        this.controls.appendChild(button)
    }

    ship_pleaced() {
        if (ShipList.ship_list.length === 0) {
            this.createButton("Start the game", () => {
                this.start_game()
            })
        } else {
            this.controls.innerText = ""
        }
    }

    start_game() {
        this.controls.innerText = ""
        this.p_gracz.lock()
        Socket.ready(JSON.stringify(this.p_gracz.to_json()))
        //this.move()
    }

    turn(t) {
        if (this.end()) {
            return
        }

        if (t.type === 2) {
            t.check_for_sink()
            this.move()
        } else {
            this.next()
        }
    }

    next() {
        this.player = this.player === 1 ? 0 : 1
        this.move()
    }

    move() {
        this.controls.innerText = this.player === 0 ? "Ruch gracza" : "Ruch bota"
        if (this.player === 1) {
            this.p_bot.lock()
            setTimeout(() => {
                let x = this.bot.make_move()
                x.shoot()
                this.turn(x)
            }, 500 + Math.floor(Math.random() * 20)) * 100;
        } else {
            this.p_gracz.lock()
            /*
                        setTimeout(() => {
                            let x = this.bot2.make_move()
                            x.shoot()
                            this.turn(x)
                        }, 500 + Math.floor(Math.random() * 20)) * 100;
                        */
            this.p_bot.play((t) => {
                this.turn(t)
            })
        }
    }

    end() {
        if (this.p_bot.is_end()) {
            this.p_bot.lock()
            this.p_gracz.lock()
            this.p_bot.hide(false)
            this.p_gracz.hide(false)
            this.p_bot.update_ships()
            this.p_gracz.update_ships()

            setTimeout(() => {
                this.controls.innerText = ""
                alert("Gracz wygrał")
                this.createButton("Zagraj jeszcze raz", () => {
                    this.restart()
                })
            }, 100)
            return true

        }
        if (this.p_gracz.is_end()) {
            this.p_bot.lock()
            this.p_gracz.lock()
            this.p_bot.hide(false)
            this.p_gracz.hide(false)
            this.p_bot.update_ships()
            this.p_gracz.update_ships()
            setTimeout(() => {
                this.controls.innerText = ""
                alert("Bot wygrał")
                this.createButton("Zagraj jeszcze raz", () => {
                    this.restart()
                })
            }, 100)
            return true
        }
        return false
    }

    restart() {
        this.init()
    }
}