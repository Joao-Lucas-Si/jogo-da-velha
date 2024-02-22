import WebSocket, { Server } from "ws"
import app from "./app"
import generateRoomId from "./utilities/generateRoomId"

function onError(ws: WebSocket, err: Error, id: string) {
    clients.delete(id)
}

interface Data {
    room: string,
    column: number,
    row: number,
    symbol: string
}


const clients = new Map<string, WebSocket>()

function onMessage(ws:WebSocket, data: Data) {
    console.log(data)
    Array.from(clients.values()).forEach(client => client.send(JSON.stringify(data))) 
}

function onConnection(ws: WebSocket, req: Request) {
    const id = generateRoomId(8)
    ws.on("message", (data: string) => onMessage(ws, JSON.parse(data)))
    ws.on("error", err => onError(ws, err, id))
    ws.on("close", () => clients.delete(id))

    clients.set(id, ws)
}


export default (server: ReturnType<typeof app["listen"]>)=> {
    const ws = new Server({
        port: 6960,
        path: "/game"
    })

    ws.on("connection", onConnection)
}