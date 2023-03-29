const nodemailer = require('nodemailer')

async function sendConfirmationEmail (passengerEmail,ticketInfo,seatNumber){
    const transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        auth:{
            user:process.env.EMAIL_ADDRESS_NODEMAILER,
            pass:process.env.PASSWORD_APPLICATION_NODEMAiLER
        }
    })

    const mailOptions={
        from:'ashrefchaabeni7@gmail.com',
        to:passengerEmail,
        subject:'Train ticket reservation confirmation',
        html: `<h1> Thank you for booking  a train ticket on our rails</h1>
                <p>Your ticket informations :</p>
                <ul>
                <li> Train name : ${ticketInfo.trainName} </li>
                <li> Departure time: ${ticketInfo.departureTime} </li>
                <li> Arrival time : ${ticketInfo.arrivalTime} </li>
                <li> Seat number: ${seatNumber} </li>
                <li> Seat number: ${ticketInfo?.price}£</li>
                </ul> `
    }

    try{
        const info = await transporter.sendMail(mailOptions)
        
    }catch(error){
        throw new Error(error)
    }
}

module.exports ={sendConfirmationEmail}