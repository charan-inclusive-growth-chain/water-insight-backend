const mongoose = require('mongoose');


const projectSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  title: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  fundingTarget: {
    type: Number,
    required: true
  },
  minimumStakeAmount: {
    type: Number,
    required: true
  },
  closeTime: {
    type: Date,
    required: true
  },
  dataHash: {
    type: String,
    required: true
  },
  forVotes: {
    type: Number,
    required: true,
    default: 0
  },
  againstVotes: {
    type: Number,
    required: true,
    default: 0
  },
  abstainVotes: {
    type: Number,
    required: true,
    default: 0
  },
  forAmount: {
    type: Number,
    required: true,
    default: 0
  },
  againstAmount: {
    type: Number,
    required: true,
    default: 0
  },
  abstainAmount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['voting', 'defeated', 'succeeded'],
    required: true
  },
  file: {
    type: Buffer,
    optional: true
  },
  summary: {
    type: String
  },
  email:{
    type:String,
    required:true
  }
});



const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
