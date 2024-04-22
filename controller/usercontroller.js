const User = require("../model/usermodel")
const jwt = require("jsonwebtoken")


const genToken = async (id) => {
    return await jwt.sign({
        id: id
    }, "secret" ,{
        expiresIn: 24 * 60 * 60 // one day
        // expiresIn: '1d'
    })
}


const signup = async (req, res) => {
    let {
        name,
        phone,
        email,
        password
    } = req.body

    let userData = await User.create({
        name,
        phone,
        email,
        password
    })

    if (userData) {
        return res.status(200).json({
            status: "success"
        })
    }
    res.status(400).json({
        staus: "failed"
    })
}

const signin = async (req, res) => {
    try {
        let userInfo = await User.findOne({
            email : req.body.email
        })

        if (userInfo) {
            const token = await genToken(userInfo._id)
            console.log(token)
            return res.status(200).json({
                status: "success",
                token
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: "failed",
            message: error.message
        })
    }
}

const allUser = async (req, res) => {
    console.log(req.user)
    const users = await User.find()
    res.status(200).json({
        status: "success",
        users
    })
}


module.exports = {
    signup,
    signin,
    allUser
}