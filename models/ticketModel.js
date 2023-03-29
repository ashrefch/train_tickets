const mongoose = require("mongoose")

const trainTicketSchema  = new mongoose.Schema({
    trainName:{
        type:String,
        required:true
    },
    departureTime:{
        type:String,
        required:true
    },
    arrivalTime:{
        type:String,
        required:true
    },
   
    totalSeats:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    availableSeats:[Number],
    bookedSeats:[{seatNumber:Number,passengerName:String}]
})

module.exports = mongoose.model("trainTicket",trainTicketSchema)