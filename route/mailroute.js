const express = require("express")
const {
    sendMail,
    myInbox,
    sentMails
} = require("../controller/mailController")
const auth = require("../middleware/auth")

const mailRoute = express.Router()

mailRoute.post("/send", auth, sendMail)
mailRoute.get("/inbox", auth, myInbox)
mailRoute.get("/sent", auth, sentMails)


module.exports = mailRoute