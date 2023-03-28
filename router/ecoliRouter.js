const path = require("path");
require("dotenv").config({path: path.resolve(__dirname,'../config/.env')});
const {Router} = require('express');
const Ecoli = require("../database/models/ecoli");
const Contributions = require("../database/models/Contributions")
const axios = require("axios");
const moment = require("moment");
const auth = require("../middleware/auth")

const router = new Router();

router.post("/results",auth,  async (req, res) => {
  try {
    const docs = await Ecoli.find({});
    if (!docs) {
      return res.status(200).send({
        status_code:200,
        message:"No Records Found! Please Refresh to fetch Data"

      });
    }
    res.status(200).send({
      status_code:200,
      data:docs,
    });
  } catch (e) {
    res.status(500).send({
      status_code:500,
      message:"DataBase Error"
    });
  }
});

router.post("/refresh", auth, async (req, res) => {
  var config = {
    method: "get",
    url: process.env.THINGSPEAK_API_URL,
    headers: {},
  };

  await axios(config)
    .then(async function (response) {
      const channelId = response.data.channel.id;
      const feeds = response.data.feeds;
      const datetimeFormat = "YYYY-MM-DDTHH:mm:ssZ";
      var resultObject = [];
      var item = 0;
      const totalFeeds = feeds.length;

      //Random ID Generation
      // var RandomList = [];
      // while (RandomList.length < totalFeeds) {
      //   var r = Math.floor(Math.random() * 100) + 1;
      //   if (RandomList.indexOf(r) === -1) RandomList.push(r);
      // }

      var i = 1;
      var initialTime = feeds[0].created_at;
      resultObject.push({
        StartedValue: Math.max(
          ...Object.values(feeds[0]).slice(3).map(parseFloat)
        ),
      });
      
      resultObject[item].Date = initialTime;
      var diff = 0;
      while (i < totalFeeds) {
        const currentDatetime = moment(feeds[i].created_at, datetimeFormat);
        diff = currentDatetime.diff(initialTime, "hours");
        if (diff <= 12) {
          // console.log(diff, "Incrementing", feeds[i].entry_id);
          i = i + 1;
        } else {
          var check = Math.max(
            ...Object.values(feeds[i - 1])
              .slice(3)
              .map(parseFloat)
          );
          // console.log(check, feeds[i - 1]);
          if (check > resultObject[item].StartedValue) {
            check = Math.min(
              ...Object.values(feeds[i - 1])
                .slice(3)
                .map(parseFloat)
            );
          }
          resultObject[item].EndedValue = check;
          item = item + 1;
          // console.log(diff, "Incrementing", feeds[i].entry_id);
          resultObject.push({
            StartedValue: Math.max(
              ...Object.values(feeds[i]).slice(3).map(parseFloat)
            ),
          });
          initialTime = feeds[i].created_at;
          resultObject[item].Date = initialTime;
          i = i + 1;
        }
      }

      // Status, Percentage  and DeviceID Fields Assignment
      resultObject.map((feed, i) => {
        feed.percentage = parseInt((feed.EndedValue / feed.StartedValue) * 100);
        feed.id = "igcatisb@gmail.com";
        feed.channelId = channelId;
        if (feed.percentage > 50) {
          feed.status = "Normal";
        } else if (feed.percentage > 20) {
          feed.status = "Warning";
        } else if (feed.percentage < 20) {
          feed.status = "Danger";
        } else {
          feed.status = "";
        }
      });
      const filteredResult = resultObject.filter(
        (obj) => !isNaN(obj.StartedValue)
      );
      resultObject = filteredResult;
      //console.log(resultObject);

      

      for (const result of resultObject) {
        await Ecoli.findOneAndUpdate({ Date: result.Date }, result, {
          $setOnInsert: result ,
          upsert: true,
          new: true,
        }).exec();

        await Contributions.findOneAndUpdate({Date:result.Date},{...result,DataType:'ecoli', email:result.id},{
          upsert:true,
          new:true,
        }).exec();
        

      }
      // console.log("Updated", updateDocs);
      res.status(200).send({
        status_code:200,
        message:"Succesfully Updated Records."
      });
    })

    .catch(function (error) {
      res.status(500).send({
        status_code:500,
        message:"Server Error."
      });
      console.log(error);
    });
});

module.exports = router;
