import {useContext, useMemo} from "react"
import { GameContext } from "../App"
import { useParams } from "react-router-dom"

interface Props {
    column: number,
    row: number,
    socket: WebSocket
}

export default function Space({column, row, socket}: Props) {
    const gameContext = useContext(GameContext)
    const { room } = useParams()
    const filled = useMemo(() => gameContext.filleds.find(filled => filled.column === column && filled.row === row), [gameContext.filleds]) 

    return (
        <div 
            style={{border: "solid 3px #000", width: "100%", height: "100%"}} 
            className={`tile is-flex is-justify-content-center is-align-items-center is-size-1 has-text-centered ${(!filled && gameContext.round !== "current" ? "has-background-dark" : "has-background-light")} ${filled?.symbol === gameContext.currentUser.symbol ? "has-text-success" : "has-text-danger"} is-child is-one-third m-0 `} 
            onClick={() => {
            if (!filled && gameContext.round === "current") {
                gameContext.setFilleds([...gameContext.filleds, { column, row, symbol: gameContext.currentUser.symbol }])
                socket.send(JSON.stringify({ column, row, symbol: gameContext.currentUser.symbol, room }))
                gameContext.setRound("outher")
            }
        }}>
            { filled?.symbol ?? "" }
        </div>
    )
}