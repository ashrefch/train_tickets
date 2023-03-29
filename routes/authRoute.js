const express = require("express")

const {
createUser,
loginUser,
updateUser
} =require("../controllers/userController")

const router = express.Router()
const {authMiddleware}= require("../middlewares/authMiddleware")

router.post('/register',createUser)
router.post('/login',loginUser)
router.put('/edit-user',authMiddleware,updateUser)

module.exports = router