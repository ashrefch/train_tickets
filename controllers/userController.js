const User = require("../models/userModel")

const asyncHandler = require('express-async-handler')
const jwt = require("jsonwebtoken")
const { generateRefreshToken } = require("../config/refreshToken")
const {generateToken} = require('../config/jwtToken')



/* ******************* Create user *****************************/
const createUser = asyncHandler(async (req,res)=>{
    const email= req.body.email
    const findUser = await User.findOne({email:email})
    if(!findUser){
       const newUser=  new User({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password,
        mobile:req.body.mobile
       })
       newUser
       .save()
       .then(()=>{
        res.send(newUser)
       }).catch((error)=>{
        console.log(error)
       })
    }else{
        throw new Error("User already exists")
    }
})

/******************* Login User  *********************************** */

const loginUser = asyncHandler(async(req,res)=>{
    const{email,password} = req.body
    const findUser = await User.findOne({email})
    if(findUser && (await findUser.isPasswordMatched(password))){
        const refreshToken = await generateRefreshToken(findUser?._id)
        console.log(refreshToken)
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,{
                refreshToken
            },{new:true}
        )
        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            maxAge:72*60*60*1000
        })
        res.json({
            _id:findUser?._id,
            firstName:findUser?.firstName,
            lastName:findUser?.lastName,
            email:findUser?.email,
            mobile:findUser?.mobile,
            token:generateToken(findUser?._id)
        })
    }else{
        throw new Error("Invalid Credentials")
    }
})


/* ************************* Handle refresh Token ********* */

 const HandleRefreshToken = asyncHandler(async(req,res)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken)
    throw new Error("No refresh Token in cookies")
    const user = await User.findOne({refreshToken})
    if(!user) throw new Error("No refresh token present in DB or not matched")
    jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded)=>{
        if(err || user.id !==decoded.id){
            throw new Error("there is something wrong with refresh token")
        }
        const accessToken = generateToken(user?._id)
        res.json({accessToken})

    })
 })

 /* **************** Logout user ***************** */
  const logout = asyncHandler(async(req,res)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken) throw new Error ("No refresh token in cookies")
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if(!user){
        res.clearCookie("refreshToken",{
            httpOnly:true,
            secure:true
        })
        res.sendStatus(204)
    }
  })

  /* ********************** Update user **************************/
  
  const updateUser = asyncHandler(async(req,res)=>{
    const {_id} = req.user
    
    try{
        const updatedUser = await User?.findByIdAndUpdate(
            _id,
            {
                firstName:req?.body?.firstName,
                lastName:req?.body?.lastName,
                email:req?.body?.email,
                mobile:req?.body?.mobile
            },{
                new:true
            }
        )
        res.json(updatedUser)
        

    }catch(error){
        throw new Error(error)
    }
  })


  module.exports={
    createUser,
    updateUser,
    loginUser}