const mongoose = require('mongoose');

const SatelliteDataSchema = new mongoose.Schema({
  lake: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  chlorophyll: {
    type: Number,
    required: true
  },
  turbidity: {
    type: Number,
    required: true
  },
  salinity: {
    type: Number,
    required: true
  },
  waterindex: {
    type: Number,
    required: true
  },
  pH: {
    type: Number,
    required: true
  },
  dissolveoxygen: {
    type: Number,
    required: true
  },
  landTemp: {
    type: String,
    required: false
  },
  suspendedMatter: {
    type: String,
    required: false
  },
  DOM: {
    type: String,
    required: false
  },
  Status:
    {
        "chlorophyll":{
            type:String,
        },
        "salinity":{
            type:String,
        },
        "pH":{
            type:String,
        },
        "dissolveoxygen":{
            type:String,
        },
        "waterindex":{
            type:String,
        },
        "turbidity":{
          type:String,
        },
        

    }
    
  
});

const SatelliteData = mongoose.model('satellite', SatelliteDataSchema);

module.exports = SatelliteData;
