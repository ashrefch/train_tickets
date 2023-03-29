const express = require("express")
const {cancelReservation, reserveSeat, createTicket, searchAvailableSeats, updateReservation}  = require("../controllers/ticketController")
const { authMiddleware } = require("../middlewares/authMiddleware")
const router = express.Router()

router.get('/searchSeats/:trainName/:departureTime',authMiddleware,searchAvailableSeats)
router.post('/create', authMiddleware,createTicket)
router.post('/reserve',authMiddleware,reserveSeat)
router.delete('/cancel',authMiddleware,cancelReservation)
router.put('/reserve/update',authMiddleware,updateReservation)




module.exports = router