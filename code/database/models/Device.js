const mongoose = require('mongoose');
const validator = require("validator");
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
});

module.exports = mongoose.model('Device', DeviceSchema);
