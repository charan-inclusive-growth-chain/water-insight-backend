require("dotenv").config();
const axios = require("axios");
const { generateConfig } = require("../helpers/utils");
const { google } = require("googleapis");
const fs = require("fs");

//credentials configuration
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });




