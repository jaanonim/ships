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
        this.buttons = document.getElementById("buttons")
        this.ships = ships
        this.size_x = size_x
        this.size_y = size_y

        this.init()
    }

    init() {
        this.gracz_div.innerText = ""
        this.bot_div.innerText = ""
        this.controls.innerText = ""
        this.buttons.innerText = ""
        document.documentElement.style.setProperty('--x_size', this.size_x);
        document.documentElement.style.setProperty('--y_size', this.size_y);


        new ShipList(this.ships, () => {
            this.ship_pleaced()
        })

        this.p_gracz = new Map(this.size_x, this.size_y, this.gracz_div)
        this.p_gracz.generate_map()
        this.p_gracz.hide(false)
        this.p_gracz.update_ships()

        this.p_opponent = new Map(this.size_x, this.size_y, this.bot_div)
        //this.p_opponent.hide(false)
        this.p_opponent.lock()

        ShipList.selected_id = -1
        ShipList.ship_list = []
        ShipList.update()

        Socket.set_board = (obj, x, y, b = false) => {
            this.controls.innerText = "Ruch przeciwnika"
            if (b || (x == null && y == null)) {
                this.p_opponent.from_json(obj)
            } else {
                this.p_gracz.from_json(obj)
                if (this.p_gracz.plansza[x][y].type === 2) {
                    if (this.p_gracz.plansza[x][y].check_for_sink()) {
                        Socket.send_board(this.p_gracz.to_json(), null, null)
                    }
                }
            }
        }
        Socket.make_move = () => {
            this.controls.innerText = "Twój ruch"

            this.p_opponent.play((t) => {
                this.turn(t)
            })
        }
        Socket.ready_f = () => {
            this.controls.innerText = "Przeciwnik jest gotowy do gry"
        }
        Socket.win_f = (b) => {
            this.end(b)
        }
        Socket.restart_f = () => {
            this.init()
        }
        Socket.left_f = () => {
            this.p_opponent.lock()
            this.p_gracz.lock()
            this.controls.innerText = "Przeciwnik się rozłączył 😕. Aby zagrać stwóż nowy pokój."
            this.createButton("Wróć do menu", () => {
                window.location = '/menu';
            })
        }


        this.ship_pleaced()
    }

    createButton(title, callback) {
        let button = document.createElement("button")
        button.classList.add("button")
        button.innerText = title
        button.onclick = () => {
            callback()
        }
        this.buttons.appendChild(button)
    }

    ship_pleaced() {
        if (ShipList.ship_list.length === 0) {
            this.createButton("Start the game", () => {
                this.start_game()
            })
        } else {
            this.buttons.innerText = ""
        }
    }

    start_game() {
        this.buttons.innerText = ""
        this.p_gracz.lock()
        Socket.ready(JSON.stringify(this.p_gracz.to_json()))
    }

    turn(t) {
        this.p_opponent.lock()
        this.controls.innerText = "Ruch przeciwnika"
        Socket.send_board(this.p_opponent.to_json(), t.x, t.y)
    }

    end(b) {

        this.p_opponent.lock()
        this.p_gracz.lock()
        this.p_opponent.hide(false)
        this.p_gracz.hide(false)

        this.controls.innerText = b ? "Wygrałęś 🎉" : "Przegrałeś 😥"
        this.createButton("Zagraj jeszcze raz", () => {
            Socket.restart()
        })

    }
}