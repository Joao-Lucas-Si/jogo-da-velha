import bodyParser from "body-parser";
import app from "./app";
import generateRoomId from "./utilities/generateRoomId";
import websocket from "./websocket";

const port = 6969

interface User {
    name: string, 
    symbol: string
}

interface Room {
    id: string
    user1: User,
    user2?: User
}

export let rooms : Room[] = []

const server = app.listen(port, () => {
    console.log(`rodando na porta ${port}`)
})


app.get("/disponiveis", (req, res) => {
    res
        .status(200)
        .json(
            rooms.filter(room => room.user2 === undefined)
        )
})

app.post("/room/:id", (req, res) => {
    const { id } = req.params
    const room = rooms.find(room => room.id === id)
    if (room) {
        console.log(room)
        const body = req.body
        if (body.symbol !== room.user1.symbol) room.user2 = req.body
        res
            .status(200)
            .json(room)
    }
    else res    
        .status(400)
})

app.post("/criar-sala", (req, res) => {
    const body: User = req.body
    console.log(req.body)
    console.log(body)
    rooms.push({
        id: generateRoomId(5),
        user1: body
    })
    console.log(rooms)
    console.log(rooms[rooms.length - 1])
    res
        .status(200)
        .json(rooms[rooms.length - 1])
})


app.get("/room/:id/delete", (req, res) => {
    const {id} = req.params
    console.log("delete")
    console.log(rooms)
    rooms = rooms.filter(room => room.id !== id)
    console.log(rooms)
    console.log(id)
    res
        .status(200)
        .json(rooms)
})

app.use("*", (req, res) => {
    res
        .status(404)
})

websocket(server)