const express = require('express');
const axios = require("axios");
const Ecoli = require("../database/models/ecoli");
const DeviceData = require("../database/models/devicedata");
const Contributions = require("../database/models/Contributions");
const Satellite = require("../database/models/Satellite")
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/contributions",auth,async (req,res) => {
    try {
        const ecoli_docs = await Ecoli.find({id:req.user.email}).select('Date');
        const device_data_docs = await DeviceData.find({deviceId:req.user.email}).select('Date');
        const docs = ecoli_docs + device_data_docs;
        if (!docs) {
            return res.status(200).send({
              status_code:200,
              message:"No Records Found! Please Refresh to fetch Data"
      
            });
        }
        res.status(200).send({
            status_code:200,
            data:{ecoli_docs, device_data_docs}
        });

    }catch (e) {
        console.log(e);
        res.status(500).send({
          status_code:500,
          message:"DataBase Error"
        });
      }
})

router.post("/allcontributions",auth,async (req,res) => {
  try {
    const result = await Contributions.aggregate([
      { $group: { _id: '$DataType', count: { $sum: 1 } } },
      { $project: { _id: 0, DataType: '$_id', count: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
})


  // Define post request route
  router.post('/refresh/satellite', async (req, res) => {
    try {
      // Create a new satellite data document from request body
      
      const response = await axios.post('http://41b1-3-111-38-4.ngrok.io/api/insertcustom',  {
        // change above url from /api/insert to /api/insertcustom
        start_date: '2023-03-13',
        end_date: '2023-03-18'
      })

      for(let value in response.data) {
        var result = response.data[value];

      // Calculate status based on thresholds
      const { NDCI: chlorophyll,  NDTI: turbidity,  NDSI: salinity, NDWI: waterindex,  pH, DO: dissolveoxygen, lake, "Start Date":startDate, "End Date":endDate, "landTemp": landTemp, "SuspendedMatter":suspendedMatter, DOM } = result;
      var newSatelliteData = {chlorophyll, turbidity, salinity, waterindex, dissolveoxygen, lake, startDate, endDate, landTemp, suspendedMatter, DOM, pH}
      newSatelliteData.Status = {}
      // Check NDCI value
      if (chlorophyll >= -0.1 && chlorophyll <= 0.2) {
        
        newSatelliteData.Status.chlorophyll = "good";
      } else if (chlorophyll > 0.2 && chlorophyll <= 0.5) {
        
        newSatelliteData.Status.chlorophyll = "average";
      } else {
        
        newSatelliteData.Status.chlorophyll = "poor";
      }
  
      // Check pH value
      if ((pH >= 6.5 && pH <= 8.5) || (pH >= 4 && pH <= 6.6) || (pH >= 8.5 && pH <= 11)) {
        newSatelliteData.Status.pH = "good";
      } else if ((pH >= 1 && pH <= 4) || (pH >= 11 && pH <= 14)) {
        newSatelliteData.Status.pH = "poor";
      } else {
        newSatelliteData.Status.pH = "average";
      }
  
      // Check NDTI value
      if (turbidity >= -0.2 && turbidity <= 0) {
        newSatelliteData.Status.turbidity = "good";
      } else if (turbidity > 0 && turbidity <= 0.2) {
        newSatelliteData.Status.turbidity = "average";
      } else {
        newSatelliteData.Status.turbidity = "poor";
      }
  
      // Check dissolved oxygen value
      if (dissolveoxygen > 6.5) {
        newSatelliteData.Status.dissolveoxygen = "good";
      } else if (dissolveoxygen >= 4 && dissolveoxygen <= 6.5) {
        newSatelliteData.Status.dissolveoxygen = "average";
      } else {
        newSatelliteData.Status.dissolveoxygen = "poor";
      }
      
      //check waterindex value 
      if(waterindex < 0) {
        newSatelliteData.Status.waterindex = "poor";
      }
      else if(waterindex < 0.2) {
        newSatelliteData.Status.waterindex = "average";
      }
      else {
        newSatelliteData.Status.waterindex = "good";
      }

       // Save the new document to database
       await Satellite.findOneAndUpdate({startDate: newSatelliteData.startDate, endDate:newSatelliteData.endDate, lake:newSatelliteData.lake}, newSatelliteData, {
        $setOnInsert:result,
        upsert:true,
        new:true
      }).exec();

     
      }
  
      res.status(200).send({
        message:"succesfully updated",
        status:200
      })
    } catch (error) {
      if (error.name ==  'CastError') {
        res.status(404).send({
          message:"Data not available in this time period ",
          status:404,
        });
      } else {
        console.error(error);
        res.status(500).send('Server Error');
      }
    }
    
  });

router.post("/get/satellite",  async (req,res) => {
  try {
    const satellite_docs = await Satellite.find({})
    if(!satellite_docs) {
      res.status(200).send({
        status_code:200,
        message:"No Records Found!, Please refresh to fetch Data"
      })
    }
      res.status(200).send({
        status_code:200,
        data:{satellite_docs}
    })
    }
  catch(e) {
    console.log(e);
    res.status(500).send({
      status_code:500,
      message:"Server Error"
    })
  }
})

module.exports = router;