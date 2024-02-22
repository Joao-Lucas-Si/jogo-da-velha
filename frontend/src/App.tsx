import { useState, createContext, useEffect } from 'react'
import { createBrowserRouter, redirect, RouterProvider } from "react-router-dom"
import Rooms from './routes/rooms'
import GameRoom from './routes/game'

export interface User {
  name: string,
  symbol: string

}

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Rooms/>
  },
  {
    path: "/:room",
    element: <GameRoom />
  }
])

export interface Filled {
  column: number,
  row: number
  symbol: string
}

export interface GameContext {
  currentUser: User,
  setCurrentUser: (user: User) => void,
  setOutherUser: (user: User) => void,
  outherUser: User,
  filleds: Filled[],
  setFilleds: (filleds: Filled[]) => void,
  isWin: boolean,
  isLoss: boolean,
  setIsWin: (isWin: boolean) => void,
  setIsLoss: (isLoss: boolean) => void,
  isLoading: boolean,
  setIsLoading: (isLoading: boolean) => void,
  hasDraw: boolean,
  setHasDraw: (hasDraw: boolean) => void,
  round: "current"|"outher",
  setRound: (round: "current"|"outher") => void
}

export const GameContext = createContext<GameContext>({
  currentUser: {
    name: "",
    symbol: "X"
  },
  isWin: false,
  isLoss: false,
  setIsLoss: (isLoss) => {},
  setIsWin: (isWin) => {},
  isLoading: false,
  setIsLoading: (isLoading) => {},
  hasDraw: false,
  setHasDraw: (hasDraw) => {},
  filleds: [],
  outherUser: {
    name: "",
    symbol: "O"
  },
  setCurrentUser: (user) => {},
  setOutherUser: (user) => {},
  setFilleds: (filleds) => {},
  round: "current",
  setRound: (round) => {}
})

function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    name: localStorage.getItem("name") ?? "",
    symbol: localStorage.getItem("symbol") ?? "X",
  })
  const [outherUser, setOutherUser] = useState<User>({
    name: "",
    symbol: "O"
  })

  const [filleds, setFilleds] = useState<GameContext["filleds"]>([])

  const [isWin, setIsWin] = useState(false)

  const [isLoss, setIsLoss] = useState(false)

  const [hasDraw, setHasDraw] = useState(false)

  const [round, setRound] = useState<"current"|"outher">("current")


  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem("name", currentUser.name)
    localStorage.setItem("symbol", currentUser.symbol)
  }, [currentUser])



  return (
    <GameContext.Provider value={{ currentUser, setCurrentUser, outherUser, setOutherUser, filleds, setFilleds, isWin, setIsWin, isLoss, setIsLoss, hasDraw, setHasDraw, isLoading, setIsLoading, round, setRound }}>
      <div style={{ minHeight: "100vh" }} className='is-fullheight'>
        <RouterProvider router={routes} />
      </div>
      { isLoading && <div className='modal is-flex'>
        <div className="modal-background"></div>
        <div className="modal-content">
          <h2 className='has-text-light is-size-2 has-text-centered'>carregando</h2>
          <progress className="progress is-primary"></progress>
        </div>
      </div> }
    </GameContext.Provider>
  )
}

export default App


export function resetContext(context: GameContext) {
  context.setOutherUser({
    name: "",
    symbol: "O"
  })
  context.setRound("current")
  context.setFilleds([])
  context.setIsLoss(false)
  context.setIsWin(false)
  context.setHasDraw(false)
}