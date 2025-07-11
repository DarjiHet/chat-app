const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./conifg/dbConnect');
const bodyParser = require('body-parser')
const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute')
dotenv.config();


const PORT = process.env.PORT;
const app = express()

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

//database connection

connectDb();

//routes
app.use('/api/auth', authRoute)
app.use('/api/chat', chatRoute)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})