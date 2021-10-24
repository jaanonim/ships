import {
    io
} from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export default class Socket {

    static room
    static socket

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

    setup() {
        Socket.socket.on("connect", () => {
            console.log(Socket.socket.id);
        });

        Socket.socket.on("disconnect", () => {
            window.location = '/menu';
        });

        Socket.socket.on("status", (msg) => {
            console.log(msg);
        });

        Socket.socket.on("start", (msg) => {
            console.log("start", msg);
        });

        Socket.socket.on("move", (msg) => {
            console.log("move", msg);
        });
    }
}