const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./conifg/dbConnect');


dotenv.config();


const PORT = process.env.PORT;
const app = express()


//database connection

connectDb();

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})