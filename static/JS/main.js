import GameManager from "./classes/game_manager.js"
import Socket from "./classes/socket.js"

window.addEventListener('DOMContentLoaded', (event) => {

    //new GameManager([0, 1, 2, 1, 1], 10, 10)
    window.GM = new GameManager([4, 3, 2, 1], 10, 10)
    let room = window.location.pathname.replace("/game/", "")
    navigator.clipboard.writeText(room)
    new Socket(room)
});