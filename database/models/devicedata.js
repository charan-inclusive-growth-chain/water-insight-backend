const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deviceDataschema = new Schema({
  deviceId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: false,
  },
  fileName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  uniqueMessageId: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model("deviceData", deviceDataschema);
