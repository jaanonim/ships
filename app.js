const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 5050

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('static'));

const {
    Server
} = require("socket.io");
const io = new Server(server);


server.listen(PORT, () => console.log("Listening on http://localhost:" + PORT))



app.get("/", (req, res) => {
    res.redirect("/menu")
})

app.get("/game/", (req, res) => {
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
    console.log("connection", socket.id)

    let room = socket.handshake.query.room

    const clients = io.sockets.adapter.rooms.get(room);
    const numClients = clients ? clients.size : 0;

    if (numClients > 1) {
        socket.disconnect();
        return
    }

    socket.join(room)

    if (rooms[room] == undefined) {
        rooms[room] = {
            players: 1,
            ready: 0
        }
    } else {
        if (rooms[room].players > 1) {
            socket.disconnect()
            return
        }
        rooms[room].players++

        if (rooms[room].ready > 0) {
            io.to(room).emit("status", Object.keys(rooms[room].boards)[0])
        }
    }




    socket.on("ready", (msg) => {
        console.log("ready", msg)

        rooms[room].ready++;
        if (rooms[room]["boards"] == null) {
            rooms[room]["boards"] = {}
        }
        rooms[room]["boards"][socket.id] = JSON.parse(msg)

        io.to(room).emit("status", socket.id)
        if (rooms[room].ready == 2) {
            io.to(room).emit("start", rooms[room].boards)
            rooms[room]["turn"] = Math.round(Math.random())
            io.to(room).emit("move", Object.keys(rooms[room].boards)[rooms[room]["turn"]])
        }

    })

    socket.on("plansza", (msg) => {
        console.log("plansza", msg)

        rooms[room]["boards"][socket.id] = msg.board
        io.to(room).emit("plansza", {
            id: msg.id,
            x: msg.x,
            y: msg.y,
            board: rooms[room]["boards"][socket.id]
        })

        if (msg.x == null && msg.y == null) {
            return
        }

        if (is_gameover(msg.board)) {
            io.to(room).emit("end", socket.id)
            return
        }

        if (msg.board.plansza[msg.x][msg.y].type !== 2) {
            rooms[room]["turn"] = rooms[room]["turn"] === 1 ? 0 : 1
        }
        io.to(room).emit("move", Object.keys(rooms[room].boards)[rooms[room]["turn"]])
    })

    socket.on("restart", (msg) => {
        console.log("restart", msg)

        rooms[room] = {
            ready: 0,
            players: 2
        }
        io.to(room).emit("restart")
    })

    socket.on('disconnecting', (socket) => {
        console.log("disconnect", socket)

        io.to(room).emit("left")
        const c = io.sockets.adapter.rooms.get(room).size;
        if (c < 2) {
            delete rooms[room]
        }

    });
});

function is_gameover(board) {
    for (let x = 0; x < board.size_x; x++) {
        for (let y = 0; y < board.size_y; y++) {
            if (board.plansza[x][y].type === 2 && !board.plansza[x][y].hit) {
                return false
            }
        }
    }
    return true
}