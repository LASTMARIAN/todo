import express from 'express'
import cors from 'cors'
import todoRouter from './todoRouter/todoRouter.js'

const port = process.env.PORT

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/', todoRouter)

app.listen(port)

app.use((err,req,res,next) => {
    const statusCode = err.status || 500
    res.status(statusCode).json({
        error: {
            message: err.message,
            status: statusCode
        }
    })
})