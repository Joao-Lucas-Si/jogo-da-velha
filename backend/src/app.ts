import express from "express"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"

const app = express()


app.use(cors({ origin: "*" }))

app.use(helmet())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

export default app
