const {Router} = require('express');
const Ecoli = require("../database/models/ecoli");
const axios = require("axios");
const moment = require("moment");

const router = new Router();

router.get("/results", async (req, res) => {
  try {
    const docs = await Ecoli.find({});
    if (!docs) {
      return res.status(400).send({});
    }
    res.status(200).send(docs);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/refresh", async (req, res) => {
  var config = {
    method: "get",
    url: "https://api.thingspeak.com/channels/2002408/feeds.json?api_key=N6ZF1SSU0TB7YHDH",
    headers: {},
  };

  await axios(config)
    .then(async function (response) {
      const feeds = response.data.feeds;
      const datetimeFormat = "YYYY-MM-DDTHH:mm:ssZ";
      var resultObject = [];
      var item = 0;
      const totalFeeds = feeds.length;

      //Random ID Generation
      var RandomList = [];
      while (RandomList.length < totalFeeds) {
        var r = Math.floor(Math.random() * 100) + 1;
        if (RandomList.indexOf(r) === -1) RandomList.push(r);
      }

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
        feed.id = RandomList[i];
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

      const updateDocs = [];

      for (const result of resultObject) {
        const doc = await Ecoli.findOneAndUpdate({ Date: result.Date }, result, {
          upsert: true,
          new: true,
        }).exec();
        updateDocs.push(doc);
      }
      console.log("Updated", updateDocs);
      res.status(200).send(updateDocs);
    })

    .catch(function (error) {
      res.status(500).send(error);
      console.log(error);
    });
});

module.exports = router;