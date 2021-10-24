import {
    io
} from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export default class Socket {

    static room
    static socket
    static opponent_id
    static set_board
    static make_move
    static ready_f
    static win_f
    static restart_f

    constructor(room) {
        Socket.socket = io('', {
            query: {
                room: room
            }
        });
        Socket.room = room
        this.setup()
    }

    static ready(map_json) {
        Socket.socket.emit("ready", map_json)
    }

    static send_board(map_json, x, y) {
        console.log(Socket.socket.id, Socket.opponent_id);
        let id = Socket.opponent_id
        Socket.socket.emit("plansza", {
            id: id,
            x: x,
            y: y,
            board: map_json
        })
    }

    static restart() {
        Socket.socket.emit("restart")
    }

    setup() {
        Socket.socket.on("connect", () => {
            console.log("connect", Socket.socket.id);
        });

        Socket.socket.on("disconnect", () => {
            console.log("disconnect");
            window.location = '/menu';
        });

        Socket.socket.on("status", (msg) => {
            console.log("status", msg);
            if (Socket.socket.id !== msg) {
                Socket.opponent_id = msg
                Socket.ready_f()
            }
        });

        Socket.socket.on("start", (msg) => {
            console.log("start", msg);
            Socket.set_board(msg[Socket.opponent_id], true)
        });

        Socket.socket.on("move", (msg) => {
            console.log("move", msg);
            if (Socket.socket.id === msg) {
                Socket.make_move()
            }
        });

        Socket.socket.on("plansza", (msg) => {
            console.log("plansza", msg, Socket.socket.id, Socket.opponent_id);
            if (Socket.socket.id === msg.id) {
                Socket.set_board(msg.board)
            }
        })
        Socket.socket.on("end", (msg) => {
            console.log("end", msg);
            Socket.win_f(Socket.socket.id === msg)
        })
        Socket.socket.on("restart", (msg) => {
            console.log("restart", msg);
            Socket.restart_f()
        })
    }
}