const mongoose = require('mongoose');

const stakeSchema = new mongoose.Schema({
  walletId: {
    type: String,
    required: true
  },
  projectId: {
    type: Number,
    required: true
  },
  stakeAmount: {
    type: Number,
    required: true
  }
});

const Stake = mongoose.model('Stake', stakeSchema);

module.exports = Stake;
