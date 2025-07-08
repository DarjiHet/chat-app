const mongoose = require('mongoose');

const connectDb = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log('connected to DB')
        });
    }catch(err){
        console.error('error connecting database', err.message)
        process.exit(1);
    }
}

module.exports = connectDb;