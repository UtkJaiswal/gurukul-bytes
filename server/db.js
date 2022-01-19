//connect to mongoose

const mongoose = require('mongoose')

const mongoURI = "mongodb+srv://dbUser:4F_E$$4T.nLSneb@cluster0.99wh3.mongodb.net/gurukul-bytes?retryWrites=true&w=majority"

const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Connected to server successfully")
    })
}

module.exports = connectToMongo;