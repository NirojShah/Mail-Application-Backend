const express = require("express")
const {
    sendMail,
    myInbox,
    sentMails,
    saveToDrafts
} = require("../controller/mailController")
const auth = require("../middleware/auth")

const mailRoute = express.Router()

mailRoute.post("/send", auth, sendMail)
mailRoute.get("/inbox", auth, myInbox)
mailRoute.get("/sent", auth, sentMails)
mailRoute.post("/draft", auth, saveToDrafts)
    

module.exports = mailRoute