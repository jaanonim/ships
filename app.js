const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('static'));

const {
    Server
} = require("socket.io");
const io = new Server(server);


server.listen(5000, () => console.log("Listening on http://localhost:5000"))



app.get("/", (req, res) => {
    console.log("ok")
    res.redirect("/menu")
})

app.get("/game/:code", (req, res) => {
    let code = req.params.code
    if (code != null) {
        res.sendFile(__dirname + "/static/game.html")
        return
    }
    res.redirect("/menu")
})

app.get("/menu", (req, res) => {
    res.sendFile(__dirname + "/static/menu.html")
})


app.post("/create", (req, res) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            characters.length));
    }
    res.redirect("/game/" + result)
})

app.post("/join", (req, res) => {
    res.redirect("/game/" + req.body.code)
})


var rooms = {}

io.on('connection', (socket) => {
    let room = socket.handshake.query.room

    const clients = io.sockets.adapter.rooms.get(room);
    const numClients = clients ? clients.size : 0;

    if (numClients > 1) {
        socket.disconnect();
        return
    }

    socket.join(room)
    rooms[room] = {
        ready: 0
    }

    socket.on("ready", (msg) => {
        console.log("ready", msg)

        rooms[room].ready++;
        if (rooms[room]["boards"] == null) {
            rooms[room]["boards"] = {}
        }
        rooms[room]["boards"][socket.id] = JSON.parse(msg)
        console.log("ready", rooms[room]["boards"])

        io.to(room).emit("status", socket.id)
        if (rooms[room].ready == 2) {
            io.to(room).emit("start", rooms[room].boards)
            rooms[room]["turn"] = Math.round(Math.random())
            io.to(room).emit("move", Object.keys(rooms[room].boards)[rooms[room]["turn"]])
        }

    })

    socket.on("plansza", (msg) => {

        let obj = JSON.parse(msg)

        rooms[room]["boards"][socket.id] = obj.board
        io.to(room).emit("plansza", {
            id: socket.id,
            board: rooms[room]["boards"][socket.id]
        })


        if (obj.board.plansza[obj.x][obj.y].type === 2) {
            rooms[room]["turn"] = rooms[room]["turn"] === 1 ? 0 : 1
        }
        io.to(room).emit("move", Object.keys(rooms[room].boards)[rooms[room]["turn"]])
    })

});


io.on('disconnect', (socket) => {

});