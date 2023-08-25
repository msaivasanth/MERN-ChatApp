const mongoose = require('mongoose')

const connectToMongo = () => {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connected To mongoDB Succesfully");
}

module.exports = connectToMongo