const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
  dataType: {
    type: String,
    enum: ['ecoli', 'satellite', 'devicedata'],
    required: true,
    unique: true
  },
  perDayPrice: {
    type: Number,
    required: true,
    default: 10
  }
});

module.exports = mongoose.model('Price', PriceSchema);
