const mongoose = require("mongoose")
const http = require("http");
const app = require("./app");

const server = http.createServer(app)


mongoose.connect("mongodb://127.0.0.1:27017/maildb").then(() => {
    console.log("DB CONNECTED..")
}).catch((err) => {
    console.log(err)
})
server.listen(5000, (err) => {
    if (err) console.log("err")
    console.log("server started")
})