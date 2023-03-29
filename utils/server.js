const express = require("express")
const authRoute  = require('../routes/authRoute')
const reservationRoute = require('../routes/reservationRoute')
module.exports=  function createServer(){
    const app = express()
    app.use(express.json())
    app.use("/api/user",authRoute)
app.use('/api/tickets',reservationRoute)
    
    return app
}

