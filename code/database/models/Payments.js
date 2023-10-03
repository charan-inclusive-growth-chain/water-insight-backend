const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  DateOfPayment: {
    type: Date,
    required: true
  }
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
