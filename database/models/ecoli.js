const mongoose = require("mongoose");

const ecoliSchema = new mongoose.Schema({
  StartedValue: {
    type: Number,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
  EndedValue: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ecoli", ecoliSchema);
