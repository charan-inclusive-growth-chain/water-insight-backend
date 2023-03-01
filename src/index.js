require('dotenv').config();
require('../database/DBconnect')
//const deviceDataRouter = require("../router/deviceDataRouter");
const ecoliRouter = require("../router/ecoliRouter")

const express = require("express");
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));



// app.use('/api/devicedata',deviceDataRouter);
app.use('/api/ecolidata',ecoliRouter);


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})
