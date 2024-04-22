const express = require("express")
const cors = require("cors")
const userRoute = require("./route/userRoute")
const mailRoute = require("./route/mailroute")


const app = express()

app.use(cors({
    origin: 'http://localhost:5173'
}))

app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))

app.use("/app/user", userRoute)
app.use("/app/mail", mailRoute)


module.exports = app