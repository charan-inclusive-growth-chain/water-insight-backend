const express = require('express')
const User = require('../database/models/User');
const payments = require("../database/models/Payments")
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/signup', async (req, res) => {
    
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).send({
            status_code:200,
            message:"User signed up ",
        })
    } catch (e) {
        console.log(e);
        if (e.code === 11000) {
            // handle duplicate key error
            res.status(400).send({
              status_code: 400,
              message: 'Email already exists'
            });
          }
          else if (e.name === 'ValidationError') {
            // handle validation error
            res.status(400).send({
              status_code: 400,
              message: e.message
            });
          }
           else {
            // handle other errors
            res.status(500).send({
              status_code: 500,
              message: 'Server error'
            });
          }
    }
})

router.post('/login', async (req, res) => {
    try {
        
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            "status_code":200,
            "message":"User Logged In",
            "data":{user,token},
        })
    } catch (e) {
        console.log(e.message)
        if (e.message === 'Unable to login') {
            // handle validation error
            res.status(400).send({
              status_code: 400,
              message: e.message
            });
          }
           else {
            // handle other errors
            res.status(500).send({
              status_code: 500,
              message: 'Server error',
              "mongodb-message":e.message,
            });
          }
    }
})



router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send(
            {
                "status_code":200,
                "message":"succesfully logged out",
            }
        )
    } catch (e) {
        res.status(500).send({
            status_code:500,
            message:"Request Failed, Couldn't logout user"
        })
    }
})

router.post('/get/profile', auth, async (req, res) => {
    res.send({
        status_code:200,
        message:"User Profile Found",
        "data":req.user,
    })
})

router.post('/update/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['firstname', 'lastname', 'email', 'phone', 'walletId']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            status_code:400,
            message:"Invalid updates",
         })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send({
            status_code:200,
            message:"succesfully updated!",
            "data":req.user,
        })
    } catch (e) {
        res.status(500).send({
            status_code:500,
            message:"Request Failed, Couldn't update profile"
        })
    }
})

router.post("/getpayments",auth,  async (req,res) => {
    try {
        const email = await req.user.email;
        const paymentRecords = await payments.find({email});
        console.log(paymentRecords);
        res.send({
            status_code:200,
            data:paymentRecords,
        })
        

    }catch(error){
        res.status(500).send(error.message)
    }
})




module.exports = router