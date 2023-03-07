const express = require('express')
const Order = require('../database/models/Order');
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/create',auth, async (req,res) => {
    const order = new Order({
        ...req.body,
        owner:req.user._id

    });
    try {
        await order.save();
        res.status(201).send({
            status_code:200,
            message:"Order Saved"
        })
    }
    catch(e) {
        res.status(500).send({
            status_code:500,
            message:"DataBase Error"
        })
    }
})

router.get("all",auth, async (req,res) => {
    try {
        await req.user.populate({
            path:'orders'
        }).execPopulate()
        res.send(200).send({
            status_code:200,
            data:req.user.orders
        })
    }
    catch(e) {
        res.status(500).send({
            status_code:500,
            message:"DataBase Error"
        })
    }
})

module.exports = router