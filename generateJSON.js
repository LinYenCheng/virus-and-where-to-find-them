"use strict";

const fs = require("fs");
const axios = require("axios");

function writeResToJSON(res, fileName) {
  let data = JSON.stringify(res.data);
  fs.writeFileSync(`./data/${fileName}.json`, data);
}

//var csv is the CSV file with headers
function csv2JSON(csv) {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const obj = {};
    const currentLine = lines[i]
      .replace("Korea, South", "S.Korea")
      .replace("Bonaire, Sint Eustatius and Saba", "Sint Eustatius and Saba")
      .replace(/\"/g, "")
      .split(",");

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j];
    }
    result.push(obj);
  }
  return result;
}

axios
  .get("https://od.cdc.gov.tw/eic/Weekly_Age_County_Gender_19CoV.json")
  .then((res) => {
    writeResToJSON(res, "taiwan");
  });

const instanceGithub = axios.create({
  baseURL:
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series",
  timeout: 5000,
  headers: { "X-Custom-Header": "foobar" },
});

function removeProperty(obj) {
  const tempElm = JSON.parse(JSON.stringify(obj));
  delete tempElm["Country/Region"];
  delete tempElm["Province/State"];
  delete tempElm["Lat"];
  delete tempElm["Long"];
  return tempElm;
}

function getLastData(obj) {
  const nowDate = new Date();
  return (
    obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 1}/20`] ||
    obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 2}/20`]
  );
}

function getLastDiffData(obj) {
  const nowDate = new Date();
  let intLastDiff = 0;

  if (obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 1}/20`]) {
    intLastDiff =
      parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 1}/20`]) -
      parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 2}/20`]);
  } else {
    intLastDiff =
      parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 2}/20`]) -
      parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 3}/20`]);
  }
  return intLastDiff;
}

function sumObjectsByKey(...objs) {
  return objs.reduce((a, b) => {
    for (let k in b) {
      if (b.hasOwnProperty(k)) a[k] = (parseInt(a[k]) || 0) + parseInt(b[k]);
    }
    return a;
  }, {});
}

axios
  .all([
    instanceGithub.get("/time_series_covid19_confirmed_global.csv"),
    instanceGithub.get("/time_series_covid19_recovered_global.csv"),
    instanceGithub.get("/time_series_covid19_deaths_global.csv"),
  ])
  .then(
    axios.spread((resCases, resRecovered, resDeaths) => {
      const jsonCases = csv2JSON(resCases.data);
      const jsonRecovered = csv2JSON(resRecovered.data);
      const jsonDeaths = csv2JSON(resDeaths.data);

      let sumCases;
      let sumDeaths;
      let sumRecovered;

      const finalTimeSeriesData = jsonCases
        .map((elm) => {
          let cases;
          let deaths;
          let recovered;
          let strRegion = "";

          if (elm["Province/State"] === "") {
            cases = elm;
            deaths = jsonDeaths.find(
              (elmIn) => elmIn["Country/Region"] === elm["Country/Region"]
            );
            recovered = jsonRecovered.find(
              (elmIn) => elmIn["Country/Region"] === elm["Country/Region"]
            );
            strRegion = elm["Country/Region"];
          } else {
            cases = jsonCases.find(
              (elmIn) => elmIn["Province/State"] === elm["Province/State"]
            );
            deaths = jsonDeaths.find(
              (elmIn) => elmIn["Province/State"] === elm["Province/State"]
            );
            recovered = jsonRecovered.find(
              (elmIn) => elmIn["Province/State"] === elm["Province/State"]
            );
            if (deaths === undefined || recovered === undefined) {
              console.log(elm["Province/State"]);
              return false;
            }

            strRegion = `${elm["Province/State"]}-${elm["Country/Region"]}`;
          }

          cases = removeProperty(elm);
          deaths = removeProperty(deaths);
          recovered = removeProperty(recovered);

          if (!sumCases) {
            sumCases = cases;
            sumDeaths = deaths;
            sumRecovered = recovered;
          } else {
            sumCases = sumObjectsByKey(sumCases, cases);
            sumDeaths = sumObjectsByKey(sumDeaths, deaths);
            sumRecovered = sumObjectsByKey(sumRecovered, recovered);
          }

          return {
            region: strRegion,
            country: elm["Country/Region"],
            lat: elm["Lat"],
            lng: elm["Long"],
            confirmed: getLastData(cases),
            deaths: getLastData(deaths),
            recovered: getLastData(recovered),
            newConfirmed: getLastDiffData(cases),
            newDeaths: getLastDiffData(deaths),
            newRecovered: getLastDiffData(recovered),
            timeline: {
              cases,
              deaths,
              recovered,
            },
          };
        })
        .filter((elm) => !!elm);
      writeResToJSON(
        {
          data: {
            region: "global",
            todayConfirmed: getLastData(sumCases),
            todayDeath: getLastData(sumDeaths),
            todayRecover: getLastData(sumRecovered),
            newConfirmed: getLastDiffData(sumCases),
            newDeaths: getLastDiffData(sumDeaths),
            newRecovered: getLastDiffData(sumRecovered),
            timeline: {
              cases: sumCases,
              deaths: sumDeaths,
              recovered: sumRecovered,
            },
          },
        },
        "global"
      );
      writeResToJSON({ data: finalTimeSeriesData }, "finalTimeSeriesData");
    })
  );
