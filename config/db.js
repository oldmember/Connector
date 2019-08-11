const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDb = async() => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true,
            usecreateIndex: true
        })
        console.log("mongodb connnected...")
    } catch(err) {
        console.error(err.message)
        process.exit(1)
    }
}
module.exports = connectDb