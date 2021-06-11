"use strict";

const fs = require("fs");
const axios = require("axios");
const dayjs = require("dayjs");
const csvToJSON = require("csvjson-csv2json");

function writeResToJSON(res, fileName) {
  let data = JSON.stringify(res.data);
  fs.writeFileSync(`./data/${fileName}.json`, data);
}

function writeResToCSV(res, fileName) {
  fs.writeFileSync(`./data/${fileName}.csv`, res.data);
  const data = fs.readFileSync(`./data/${fileName}.csv`, { encoding: "utf8" });
  const json = csvToJSON(data).filter((elm) => {
    const { end } = elm;
    const date1 = dayjs(end);
    const date2 = dayjs();
    const hours = date2.diff(date1, "hours");
    const days = Math.floor(hours / 24);
    return days < 14;
  });
  fs.writeFileSync(
    `./data/${fileName}.json`,
    JSON.stringify(
      json.map((elm) => {
        const tempElement = { ...elm };
        delete tempElement.GeoJSON;
        return tempElement;
      })
    )
  );
}

function writePartialTimeSeriesForAPI(finalTimeSeriesData) {
  var async = require("async");
  async.each(
    finalTimeSeriesData,
    function (file, callback) {
      fs.writeFile(
        "./docs/data/" + file.region.toLowerCase().replace("*", "") + ".json",
        JSON.stringify([{ ...file }], null, 4),
        function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log(file.region + ".json was updated.");
          }
          callback();
        }
      );
    },
    function (err) {
      if (err) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log("A file failed to process");
      } else {
        console.log("All files have been processed successfully");
      }
    }
  );
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
  // .get("https://od.cdc.gov.tw/eic/Weekly_Age_County_Gender_19CoV.json")
  .get("https://od.cdc.gov.tw/eic/Age_County_Gender_19Cov.json")
  .then((res) => {
    writeResToJSON(res, "taiwan");
  });

axios
  .get(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLkgDcQOvZO_UVnvWzF06vkX8YfD_TD3vdjTCBsnYJD8nCumrvIQxaQAAfdsjxEI1J12VD8m-NDgJW/pub?gid=582904711&single=true&output=csv"
  )
  .then((res) => {
    writeResToCSV(res, "covid-activity");
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
  //   const nowDate = new Date();
  //   return (
  //     obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 1}/20`] ||
  //     obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 2}/20`]
  //   );
  const keys = Object.keys(obj);
  const last = keys[keys.length - 1];
  return obj[last];
}

function getLastDiffData(obj) {
  const nowDate = new Date();
  let intLastDiff = 0;
  const keys = Object.keys(obj);
  const last = keys[keys.length - 1];
  const last1 = keys[keys.length - 2];
  if (last1) {
    intLastDiff = obj[last] - obj[last1];
  }

  //   if (obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 1}/20`]) {
  //     intLastDiff =
  //       parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 1}/20`]) -
  //       parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 2}/20`]);
  //   } else {
  //     intLastDiff =
  //       parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 2}/20`]) -
  //       parseInt(obj[`${nowDate.getMonth() + 1}/${nowDate.getDate() - 3}/20`]);
  //   }
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
              (elmIn) =>
                elmIn["Country/Region"] === elm["Country/Region"] &&
                elmIn["Province/State"] === ""
            );
            recovered = jsonRecovered.find(
              (elmIn) =>
                elmIn["Country/Region"] === elm["Country/Region"] &&
                elmIn["Province/State"] === ""
            );
            strRegion = elm["Country/Region"];
          } else {
            cases = jsonCases.find(
              (elmIn) =>
                elmIn["Province/State"] === elm["Province/State"] &&
                elmIn["Province/State"] !== ""
            );
            deaths = jsonDeaths.find(
              (elmIn) =>
                elmIn["Province/State"] === elm["Province/State"] &&
                elmIn["Province/State"] !== ""
            );
            recovered = jsonRecovered.find(
              (elmIn) =>
                elmIn["Province/State"] === elm["Province/State"] &&
                elmIn["Province/State"] !== ""
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
      // TODO: perf 分國家
      // 一個總的統計 for 畫圖
      writePartialTimeSeriesForAPI(finalTimeSeriesData);
      const finalTimeSeriesDataWithoutTimeline = finalTimeSeriesData.map(
        function (element) {
          // 拿掉 timeline 減少大小
          if (element.timeline !== undefined) {
            delete element.timeline;
          }
          return element;
        }
      );
      writeResToJSON(
        {
          data: finalTimeSeriesDataWithoutTimeline,
        },
        "finalTimeSeriesData"
      );
    })
  );

instanceGithub.get("/time_series_covid19_confirmed_US.csv").then((resCases) => {
  const jsonCases = csv2JSON(resCases.data);
  const finalData = jsonCases
    .map((elm) => {
      let cases = removeProperty(elm);
      return {
        region: elm["Combined_Key"],
        country: elm["Country_Region"],
        lat: elm["Lat"],
        lng: elm["Long_"],
        confirmed: getLastData(cases),
      };
    })
    .filter((elm) => elm.confirmed !== "0" && parseInt(elm.confirmed) > 500);
  writeResToJSON({ data: finalData }, "usa");
});
