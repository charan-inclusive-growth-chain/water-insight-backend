const path = require("path");
require("dotenv").config({path: path.resolve(__dirname,'../config/.env')});
const fs = require("fs");
const {Router} = require('express');
const axios = require("axios");
const ImageDB = require("../database/models/devicedata");
const refreshMail = require("../helpers/getMail.js");
const auth = require("../middleware/auth")

const router = new Router();

router.post("/refresh/:email", auth,  async (req,res) => {
  const email = req.params.email;
  await refreshMail(email);
  res.status(201).send({
    status_code: 201,
    message: "Succesfully Updated ImageDB"
  });

})

router.get("/imagedata",auth,  async (req,res) => {
  const imgDir = "C:/WORK/icg/water-insight/igc-water-insight-backend/public/images/";
  const imgPaths = await fs.promises.readdir(imgDir);
  let responseData = []
  for (const imgPath of imgPaths) {
    const data = JSON.stringify({ img_path: imgDir + imgPath });
    const mlConfig = {
      method: "post",
      url: process.env.PYTHON_SERVER_URL,
      headers: { "Content-Type": "application/json" },
      data: data,
    };

    try {
      const response = await axios(mlConfig);
      const imageDetails = await ImageDB.findOne({ fileName: imgPath });
      if (!imageDetails) {
        return res.status(500).send("Database Error");
      }
      imageDetails.K_mean_RG = response.data["K_mean_RG"];
      imageDetails.Secchi_Depth = response.data["Secchi_Depth"];
      imageDetails.Turbidity = response.data["Turbidity"];
      const result = await imageDetails.save();
 
      const updatedDetails = {
        ...imageDetails.toObject(),
        ...{
          K_mean_RG: response.data["K_mean_RG"],
          Secchi_Depth: response.data["Secchi_Depth"],
          Turbidity: response.data["Turbidity"],
        },
      };
      responseData.push(updatedDetails);
      
      // console.log(`Processed image: ${imgPath}`);
     
    } catch (error) {
      res.status(400).send({
        status_code:400,
        message:`Error processing image ${imgPath}: ${error}`
      })
    }
    
  }
  res.status(201).send({
    status_code:201,
    data:responseData
  })
})

module.exports = router;

