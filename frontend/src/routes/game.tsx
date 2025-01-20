import { useParams, useNavigate, Link } from "react-router-dom"
import { useState, ReactElement, useEffect, useContext, useCallback } from "react"
import Space from "../components/Space"
import { Filled, GameContext, User, resetContext } from "../App"
import { Helmet } from "react-helmet"

interface Message {
    room: string,
    column: number,
    row: number,
    symbol: string
}

export default function GameRoom() {
    const {room} = useParams()
    const gameContext = useContext(GameContext)
    const [socket, setSocket] = useState(new WebSocket("ws://localhost:6960/game"))
    const [spaces, setSpaces] = useState<{column: number, row: number }[][]>([])


    useEffect(() => {
        const joinRoom = async () => {
            const response = await fetch(`http://localhost:6969/room/${room}`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(gameContext.currentUser)
            })
            const roomData: {
                id: string,
                user1: User,
                user2?: User
            } = await response.json()
            if (roomData.user2) {
                gameContext.setOutherUser(roomData.user1)
                gameContext.setRound("outher")
                socket.send(JSON.stringify({...gameContext.currentUser, room}))
            }
            else {
                gameContext.setIsLoading(true)
            }
        }
        socket.onopen = joinRoom
        socket.onmessage = (event: MessageEvent<string>) => {
            const data:Message|(User & {room: string}) = JSON.parse(event.data)
            const {room: submitedRoom, ...rest} = data
            if (room === submitedRoom && rest.symbol !== gameContext.currentUser.symbol) {
                if ("row" in rest) {
                    gameContext.setFilleds([...gameContext.filleds, rest])
                    gameContext.setRound("current")
                }
                else {
                    gameContext.setIsLoading(false)
                    gameContext.setOutherUser(rest)
                }
            }
        }

    }, [gameContext.filleds])

    useEffect(()=> {
        const spaceInfo: typeof spaces = []
        for (let row = 0; row < 3; row++) {
            spaceInfo.push([])
            for (let column=0; column < 3; column++) {
                spaceInfo[row].push({ column, row })
            }
        }
        setSpaces(spaceInfo)
    }, [])
   
    useEffect(()=> {
        const win = isWin(gameContext.filleds, gameContext)
        if (win === "draw") gameContext.setHasDraw(true)
        else if (win) win === gameContext.currentUser.symbol ? gameContext.setIsWin(true) : gameContext.setIsLoss(true)
    }, [gameContext.filleds])
    const navigate = useNavigate()


    const invite = useCallback(() => {
        gameContext.setIsWin(false)
        gameContext.setIsLoss(false)
        gameContext.setHasDraw(false)
        gameContext.setFilleds([])
    }, [])

    const closeRoom = useCallback(async () => {
        const response = await fetch(`http://localhost:6969/room/${room}/delete`, {
            method: "get"
        })
        if (response.status === 200) {
            resetContext(gameContext)
            navigate("/")
        }
    }, [gameContext, room])
    return (
        <>
            <Helmet>
                <title>partida contra {gameContext.outherUser.name}</title>
            </Helmet>
            <h1 className="is-size-1 has-text-primary has-text-centered">{gameContext.currentUser.name} vs {gameContext.outherUser.name}</h1>
            <h3 className="is-size-3 has-text-centered has-text-info">{gameContext.round === "current" ? "sua rodada" : `rodada de: ${gameContext.outherUser.name}`}</h3>
            <div style={{ height: "100%" }} className=" is-flex is-align-items-center is-fex-direction-column is-justify-content-center">
                <div className="is-flex tile is-ancestor  is-justify-content-center" style={{ maxWidth: "50vw", height: "70vh" }}>
                    { spaces.map((line,i) => <div key={line[i].row} style={{ width: "30vw", height: "33%", gap: "1em" }} className="tile is-parent">{line.map(space => <Space socket={socket} key={`${space.row}-${space.column}`} {...space}/>)}</div>) }
                </div>
            </div>
            { gameContext.isWin &&
                <div className='modal' style={{ display: "flex" }}>
                    <div className='modal-background'></div>
                    <div className="modal-content has-background-light p-4 box">
                        <h3 className="has-text-success has-text-centered is-size-2 mb-4">você venceu</h3>
                        <div className="buttons">
                            <button className='button is-danger' onClick={closeRoom}>fechar</button>
                            <button onClick={invite} className="button is-success">convidar {gameContext.outherUser.name} para jogar denovo</button>
                        </div>
                    </div>
                    <button className='modal-close' onClick={closeRoom}>fechar</button>
                </div>
                
            }
            { gameContext.isLoss &&
                <div className='modal' style={{ display: "flex" }}>
                    <div className='modal-background'></div>
                    <div className="modal-content has-background-light p-4 box">
                        <h3 className="has-text-danger has-text-centered is-size-2 mb-4">você perdeu</h3>
                        <div className="buttons">
                            <button className='button is-danger' onClick={closeRoom}>fechar</button>
                            <button onClick={invite} className="button is-success">convidar {gameContext.outherUser.name} para jogar denovo</button>
                        </div>
                    </div>
                    <button className='modal-close' onClick={closeRoom}>fechar</button>
                </div>
            }
            { gameContext.hasDraw &&
                <div className='modal' style={{ display: "flex" }}>
                    <div className='modal-background'></div>
                    <div className="modal-content has-background-light p-4 box">
                        <h3 className="has-text-black has-text-centered is-size-2 mb-4">Velha</h3>
                        <div className="buttons">
                            <button className='button is-danger' onClick={closeRoom}>fechar</button>
                            <button onClick={invite} className="button is-success">convidar {gameContext.outherUser.name} para jogar denovo</button>
                        </div>
                    </div>
                    <button className='modal-close' onClick={closeRoom}>fechar</button>
                </div>
            }
            <button className="ml-6 button is-link" onClick={closeRoom}>desistir</button>
        </>
    )
}


function isWin(filleds: Filled[], gameContext: GameContext) {
    for (let row = 0; row < 3; row++) {
        let columns = []
        for (let column=0; column < 3; column++) {
            columns.push(filleds.find(filled => filled.row === row && filled.column === column))
        }
        if (isValid(columns, gameContext)) return columns[0]?.symbol
    }
    
    for (let column = 0; column < 3; column++) {
        let rows = []
        for (let row=0; row < 3; row++) {
            rows.push(filleds.find(filled => filled.row === row && filled.column === column))
        }
        if (isValid(rows, gameContext)) return rows[0]?.symbol
    }

    let vertical = []
    for (let i=0; i < 3; i++) {
        vertical.push(filleds.find(filled => filled.row === i && filled.column === i))
    }
    if (isValid(vertical, gameContext)) return vertical[0]?.symbol

    let reverseVertical = []
    for (let i=0; i < 3; i++) {
        reverseVertical.push(filleds.find(filled => filled.row === (2 - i) && filled.column === i))
    }
    if (isValid(reverseVertical, gameContext)) return reverseVertical[0]?.symbol

    if (filleds.length === 9) return "draw"
}

function isValid(filleds: (Filled|undefined)[], gameContext: GameContext) {
    return filleds.every(column => !!column && column?.symbol === gameContext.currentUser.symbol) || filleds.every(column =>  !!column && column?.symbol === gameContext.outherUser.symbol)
}