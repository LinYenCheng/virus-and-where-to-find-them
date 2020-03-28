"use strict";

const fs = require("fs");
const axios = require("axios");

function writeResToJOSON(res, fileName) {
  let data = JSON.stringify(res.data);
  fs.writeFileSync(`./data/${fileName}.json`, data);
}

const instance = axios.create({
  baseURL: "https://api.coronatracker.com/",
  timeout: 5000,
  headers: { "X-Custom-Header": "foobar" }
});

instance.get("analytics/country").then(res => {
  writeResToJOSON(res, "country");
});
instance.get("v2/analytics/area?limit=500").then(res => {
  writeResToJOSON(res, "area");
});
instance.get("v2/stats/diff/global").then(res => {
  writeResToJOSON(res, "global");
});
axios.get("https://corona.lmao.ninja/v2/historical/").then(res => {
  writeResToJOSON(res, "historical");
});
axios.get("https://corona.lmao.ninja/v2/historical/china").then(res => {
  writeResToJOSON(res, "historicalChina");
});
axios
  .get("https://od.cdc.gov.tw/eic/Weekly_Age_County_Gender_19CoV.json")
  .then(res => {
    writeResToJOSON(res, "taiwan");
  });
