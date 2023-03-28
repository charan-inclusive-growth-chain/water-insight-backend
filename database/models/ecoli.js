const mongoose = require("mongoose");
const crypto = require('crypto');
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
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  verifyId:{
    type:Number,
    required:false,
  },
  channelId: {
    type:Number,
    required:true,
  },
  hash: {
    type: String,
    required: true,
  }
});

ecoliSchema.pre('findOneAndUpdate', function(next) {
  const dataString = `${this.get('StartedValue')}${this.get('Date')}${this.get('EndedValue')}${this.get('percentage')}${this.get('id')}${this.get('status')}`;
  const hash = crypto.createHash('sha256').update(dataString).digest('hex');
  this.set('hash', hash);
  console.log(dataString,hash)
  next();
});

module.exports = mongoose.model("ecoli", ecoliSchema);
