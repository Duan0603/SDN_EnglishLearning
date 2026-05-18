import express from 'express'
import morgan from 'morgan'
import helmet from "helmet";
import  compression from 'compression'
import {checkOverload} from "./helper/checkConnect.js";
import instanceMongodb from "./db/init.mongodb.js";
import {router} from "./routes/index.js";
export const app = express()

app.use(morgan("dev"))
app.use(helmet());
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//init db
instanceMongodb

//helper (cac function ho tro, chua trong folder helper)
checkOverload()

//init route
app.use(router)

//global error handling


app.get("/", (req, res, next) => {
    const strCompress = 'This is backend port'
    return res.status(200).json({
        message: "Hello th ngu"
    })
})

app.use((req, res, next) => {
    const error = new Error('Not found route')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || "Internal server error"
    })
})
