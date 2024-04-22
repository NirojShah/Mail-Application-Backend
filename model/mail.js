const mongoose = require("mongoose")

const Mail = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    to: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    },
    body: {
        type: String
    },
    subject: {
        type: String
    }
})

module.exports = mongoose.model("mail", Mail)