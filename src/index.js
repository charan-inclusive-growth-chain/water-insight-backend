const path = require("path");
require("dotenv").config({path: path.resolve(__dirname,'../config/.env')});
require('../database/DBconnect')
const deviceDataRouter = require("../router/deviceDataRouter");
const ecoliRouter = require("../router/ecoliRouter")
const userRouter = require("../router/userRouter")

const express = require("express");
console.log(process.env.PORT);
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api/userdata',userRouter);
app.use('/api/ecolidata',ecoliRouter);
app.use('/api/devicedata',deviceDataRouter);
// app.use('/api/devicedata',deviceDataRouter);



app.get("/",(req,res) => {
    res.send("Hello . Append the API urls to the end of the ngrok url to use them . ")
})
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
