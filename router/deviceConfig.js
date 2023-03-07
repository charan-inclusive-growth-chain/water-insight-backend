const express = require('express')
const Device = require('../database/models/Device');
const router = new express.Router();

router.post('/device/config', async (req,res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).send({
            status_code:200,
            message:"Succesfully Saved the device Configuration",
        })
        
    }
    catch(e) {
        res.status(500).send({
            status_code:500,
            message:"DataBase Error"
        })
    } 
})