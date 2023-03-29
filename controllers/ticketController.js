const asyncHandler = require("express-async-handler");
const trainTicket = require('../models/ticketModel')
const {sendConfirmationEmail} = require('../config/emailConfirmation')

const createTicket = asyncHandler(async(req,res)=>{
    const {trainName,departureTime,arrivalTime,totalSeats,price} = req.body
    
try{
    const ticket = new trainTicket({
        trainName,
        departureTime,
        arrivalTime,
        totalSeats,
        price,
        availableSeats:Array.from({length:totalSeats},(_,i)=>i+1),
        bookedSeats:[]
  })
    
    const newTicket = await ticket.save()
    if(newTicket) {
       res.json(newTicket)
    }
}catch(error){
    throw new Error(error)
}
   
})

const reserveSeat = asyncHandler(async(req,res)=>{
    const {ticketId,passengerName,passengerEmail,seatNumber} = req.body
    try{
        const ticket = await trainTicket.findOne({_id:ticketId})
        if(!ticket){
            throw new Error("train ticket not found")
        }
        const seatExists = ticket.bookedSeats?.some(seat=>seat.seatNumber===seatNumber)
        if(seatExists){
            throw new Error('seat is already booked')
        }
        if(!ticket.availableSeats?.includes(seatNumber)){
            throw new Error('seat is not available')
        }
        const updatedTicket = await trainTicket.findByIdAndUpdate(
            ticketId,
            {
                $push:{bookedSeats:{seatNumber,passengerName}},
                $pull:{availableSeats:seatNumber}
            },{new:true}
        )
            await sendConfirmationEmail(passengerEmail,ticket,seatNumber)
            res.json({"message":"your reservation has been maid successfully, an email will be sent to you !"})
       
    
    }catch(error){
    throw new Error(error)}
})

const cancelReservation = asyncHandler(async(req,res)=>{
    const {ticketId,passengerName,seatNumber} = req.body
    try{
        const ticket= await trainTicket.findOne({_id:ticketId})
        if(!ticket){
            throw new Error('train ticket not found')
        }

        const seatIndex = ticket.bookedSeats.findIndex(seat=>seat.seatNumber ===seatNumber)
        if(seatIndex ===-1){
            throw new Error("seat is not booked")
        }
        ticket.bookedSeats.splice(seatIndex,1)
        ticket.totalSeats +=1
        const updatedTicket = await ticket.save()
        res.json(updatedTicket)
    }catch(error){
        throw new Error(error)
    }
})

const searchAvailableSeats=asyncHandler(async(req,res)=>{
    const {trainName,departureTime} = req.params
    try{
        const ticket = await trainTicket.findOne({trainName,departureTime})
        
        if(!ticket){
            return res.status(404).json({error:'Train is not found'})
        }
        
        const totalSeats = ticket.totalSeats
        const bookedSeats = ticket.bookedSeats?.map(seat=>seat.seatNumber)
        const availableSeats=[]
        for(let i=1;i<=totalSeats;i++){
            if(bookedSeats?.includes(i)){
                availableSeats.push({seatNumber:i,isReserverd:true})
            }else{
                availableSeats.push({seatNumber:i,isReserverd:false})
            }
        }
        res.status(200).json({availableSeats})
    }catch(error){
        throw new Error(error)
    }
})

const updateReservation = asyncHandler(async(req,res)=>{
    const {ticketId,seatNumber,passengerName,oldSeatNumber,newSeatNumber}= req.body
    try{
        const ticket = await trainTicket.findById(ticketId)
        const oldSeat = ticket.bookedSeats.find(seat=>seat.seatNumber === oldSeatNumber)
        if(!oldSeat ||oldSeat.passengerName !==passengerName){
            return res.status(400).json({message:"Invalid passenger name or seat number"})
        }
        if(ticket.bookedSeats.find(seat=>seat.seatNumber ===newSeatNumber)){
            return res.status(400).json({message:'New seat number is already reserved'})
        }

        ticket.bookedSeats=ticket.bookedSeats?.map(seat=>{
            if(seat.seatNumber === oldSeatNumber){
                seat.seatNumber= newSeatNumber
            }
            return seat
        })
        ticket.availableSeats = Array.from({length:ticket.totalSeats},(_,i)=>i+1)
        .filter(seatNumber=>!ticket.bookedSeats.some(seat=>seat.seatNumber === seatNumber))

        await ticket.save()
        res.status(200).json({message:'Reserved seat updated successfully'})

    }catch(error){
        throw new Error(error)
    }
})

module.exports = {reserveSeat,cancelReservation,createTicket,searchAvailableSeats,updateReservation}