const express = require("express")
const auth = require("../middleware/auth")
const {
    signin,
    signup,
    allUser
} = require("../controller/usercontroller")

const userRoute = express.Router()

userRoute.post("/login", signin)
userRoute.post("/signup", signup)
userRoute.get("/alluser", auth, allUser)


module.exports = userRoute