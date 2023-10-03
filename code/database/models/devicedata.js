const mongoose = require("mongoose");
const crypto = require("crypto")
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
  Date: {
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
  verifyId:{
    type:Number,
    required:false,
  },
  hash: {
    type: String,
    required: false,
  }
  

});

deviceDataschema.pre('findOneAndUpdate', function (next) {
  const data = `${this.get('deviceId')} + ${this.get('subject')} + ${this.get('fileName')} + ${this.get('message')} + ${this.get('date')} + ${this.get('uniqueMessageId')} + ${this.get('K_mean_RG')} + ${this.get('Secchi_Depth')} + ${this.get('Turbidity')}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  this.set('hash',hash)
  next();
});


module.exports = mongoose.model("deviceData", deviceDataschema);
