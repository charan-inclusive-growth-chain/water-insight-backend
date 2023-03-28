const path = require("path");

require("dotenv").config({path: path.resolve(__dirname,'../config/.env')});
require('../database/DBconnect')
const deviceDataRouter = require("../router/deviceDataRouter");
const ecoliRouter = require("../router/ecoliRouter")
const userRouter = require("../router/userRouter")
const orderRouter = require("../router/orderRouter")
const adminRouter = require("../router/adminRouter");
const daoRouter = require("../router/daoRouter");
const contributionRouter = require("../router/contributionRouter");
const cors = require("cors");
const express = require("express");

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use('/api/user',userRouter);
app.use('/api/ecolidata',ecoliRouter);
app.use('/api/devicedata',deviceDataRouter);
app.use('/api/orders',orderRouter);
app.use('/api/admin',adminRouter);
app.use('/api',contributionRouter);
app.use('/api/dao',daoRouter);
// app.use('/api/devicedata',deviceDataRouter);



app.get("/",(req,res) => {
    console.log("hit")
    res.send("Hello . Append the API urls to the end of the ngrok url to use them . ")
})
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
