const mongoose = require('mongoose');
const crypto = require('crypto');

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
    required: false,
  },
  email: {
    type: String,
    required: true,
    trim:true,
    lowercase:true,
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
}, {
  toJSON: {virtuals:true}
});

// Define a function to calculate the total price based on the start date, end date,
// and per-day price for the data type from the Price collection
OrderSchema.methods.calculateTotalPrice = async function() {
  // Calculate the number of days between the start and end dates
  const days = Math.floor((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;

  // Look up the price for the data type from the Price collection
  const price = await mongoose.model('Price').findOne({ dataType: this.dataType });

  // Calculate the total price based on the number of days and the per-day price
  const totalPrice = days * price.perDay;

  // Set the total price on the OrderSchema instance and return it
  this.price = totalPrice;
  return this;
};

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
