const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: Number,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  testingAreaType: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Device', DeviceSchema);
