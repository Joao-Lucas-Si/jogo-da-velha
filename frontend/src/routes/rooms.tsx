import { useState, useContext, useEffect, useCallback } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { GameContext } from "../App"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"

interface Room {
    user1: {
        name: string, 
        symbol: string
    }, 
    id: string
}

export default function Rooms() {
    const symbols = ["X", "O", "L"]
    const [watch, setWatch] = useState<number>()
    const gameContext = useContext(GameContext)
    const [rooms, setRoom] = useState<Room[]>([])

    useEffect(() => {
        getRooms()
        clearInterval(watch)
        const interval = setInterval(getRooms, 10000)
        setWatch(interval)
    },[gameContext.currentUser])


    const getRooms = useCallback(async () => {
        const response = await fetch("http://localhost:6969/disponiveis")
            setRoom((await response.json() as Room[]).filter(room => room.user1.symbol !== gameContext.currentUser.symbol))
    },[gameContext.currentUser])

    const navigate = useNavigate()
    const [currentSymbol, setCurrentSymbol] = useState(gameContext.currentUser.symbol)
    return (
        <div style={{ height: "100vh" }}>

            <h1 className="is-size-1 has-text-primary has-text-centered">Jogo da velha</h1>
            <div style={{gap: "1rem", height: "90%"}} className="columns p-6 is-flex-direction-row"> 
                <div style={{ height: "100%" }} className="box column p-4 is-flex align-items-center is-flex-direction-column">
                    <h2 className="has-text-centered is-size-3 is-capitalized has-text-info">suas informações</h2>
                    <div className="field">

                        <label htmlFor="user-name">
                            nomes
                            <div className="control has-icons-left">
                                <input 
                                    id="user-name" 
                                    type="text" 
                                    value={gameContext.currentUser.name}
                                    className="input is-primary" 
                                    onChange={e => gameContext.setCurrentUser({...gameContext.currentUser, name: e.target.value})}
                                />
                                <span className="icon is-small is-left">
                                    <FontAwesomeIcon icon={faUser}  />
                            
                                </span>
                            </div>
                        </label>
                    </div>
                    <h3>símbolo</h3>
                    <div className="mb-4">
                        <div className="buttons mb-0">
                            {symbols.map(symbol => <button key={symbol} onClick={() => {
                                
                                setCurrentSymbol(symbol)
                                gameContext.setCurrentUser({...gameContext.currentUser, symbol})
                            }} className={`button is-info ${currentSymbol !== symbol ? "is-outlined" : ""}`}>{symbol}</button>)}
                        </div>
                        <span className="has-text-info">dependendo do símbolo certas partidas não poderão ser acessadas já que os usuários tem que ter símbolos diferentes um do outro</span>
                    </div>
                   
                    <button onClick={() => {
                        fetch("http://localhost:6969/criar-sala", {
                            method: "post",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(gameContext.currentUser)
                        }) 
                        .then(response => response.json())
                        .then((room) => {
                            navigate(`/${room.id}`)
                        })
                    }} className="button is-link">criar partida</button>
                </div>
                <div className="box column is-one-quarter is-flex is-flex-direction-column" style={{ height: "100%" }}>
                    <h2 className="has-text-centered is-capitalized is-size-3 has-text-info">partidas</h2>
                    { rooms.map(room => <Link key={room.id} to={`/${room.id}`}>{room.user1.name} - {room.user1.symbol}</Link>) }
                </div>
            </div>
        </div>
    )
}   