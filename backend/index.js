const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./conifg/dbConnect');
const bodyParser = require('body-parser');
const authRoute = require('./routes/authRoute');
const chatRoute = require('./routes/chatRoute');
const http = require('http');
const initializeSocket = require('./services/socketService');

dotenv.config();


const PORT = process.env.PORT;
const app = express()

const corsOption = {
    origin: process.env.FRONTEND_URL,
    Credentials: true
}

app.use(cors(corsOption))

//middleware
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));


//database connection
connectDb();

// cerate server
const server = http.createServer(app)

const io = initializeSocket(server)


// apply socket middleware before routes
app.use((req, res, next) => {
    req.io = io;
    req.socketUseMap = io.socketUseMap
    next();
})


//routes
app.use('/api/auth', authRoute)
app.use('/api/chat', chatRoute)
// app.use('/api/status', )


server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})