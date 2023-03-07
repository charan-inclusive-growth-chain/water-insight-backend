const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique:true,
    trim:true,
    lowercase:true,
    validate(value) {
        if (!validator.isEmail(value)) {
            throw new Error('Email is invalid')
        }
    }
  },
  orderDate: {
    type: Date,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'fulfilled'],
    required: true
  },
  dataType: {
    type: String,
    enum: ['ecoli', 'satellite', 'devicedata'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref:'User'
  }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
