const jwt = require("jsonwebtoken")
const User = require("../model/usermodel");

const auth = async (req, res, next) => {
    try {
        let token;
        let tempToken = req.headers.authorization.split(" ")[1]
        token = jwt.verify(tempToken, "secret")
        const user = await User.findById(token.id)
        req.user = user
        next()
    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        })
    }
}

module.exports = auth