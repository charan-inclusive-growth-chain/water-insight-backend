const express = require('express')
const Order = require('../database/models/Order');
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/create',auth, async (req,res) => {
    const { startDate, endDate } = req.body;
    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();
    // const items = await Contributions.find({ Date: { $gte: startDateISO, $lte: endDateISO }, DataType:req.body.dataType });
    // const amount = 10;
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
        console.log(e);
        res.status(500).send({
            status_code:500,
            message:"DataBase Error"
        })
    }
})



router.post('/orders', auth, async (req, res) => {
    try {
      await req.user.populate('orders');
      res.send({
        status_code: 200,
        data: req.user.orders,
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

router.post('/updatestatus/:id',auth,async (req,res) => {
  const {id} = req.params;
  const updates = Object.keys(req.body)
  const allowedUpdates = ['orderStatus']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  
  if(!isValidOperation) {
    return res.status(400).send({
      status_code:400,
      message:"Invalid updates, only orderStatus field is allowed to update"
    })
  }
  const {orderStatus} = req.body;

  try {
    const order = await Order.findByIdAndUpdate(id, { orderStatus });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }


})
  

module.exports = router