const express = require("express")

const dbConnect = require("./config/dbConnect")
const dotenv = require("dotenv").config()
const bodyParser = require("body-parser")
const authRoute  = require('./routes/authRoute')
const reservationRoute = require('./routes/reservationRoute')
const {errorHandler,notFound} = require("./middlewares/errorHandler")
const createServer = require('./utils/server')


const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 5000
const app=createServer()
dbConnect()

app.use(express.json())
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieParser())
app.use("/api/user",authRoute)
app.use('/api/tickets',reservationRoute)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})