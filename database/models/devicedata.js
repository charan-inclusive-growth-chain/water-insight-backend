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
  K_mean_RG: {
    type:Number,
    required:false,
  },
  Secchi_Depth: {
    type:Number,
    required:false,
  },
  Turbidity: {
    type:Number,
    required:false,
  },
  

});


module.exports = mongoose.model("deviceData", deviceDataschema);
