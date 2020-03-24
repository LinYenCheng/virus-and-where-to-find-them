import axios from "axios";
import axiosRetry from "axios-retry";
import { setupCache } from "axios-cache-adapter";
import { locations, csvJSON, getRandomAround } from "./util.js";
import srcVirus from "./virus.png";

const map = L.map("map").setView([23.5, 120.644], 5);

const tiles = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(map);

const virusIcon = L.icon({
  iconUrl: srcVirus,
  iconSize: [25, 25], // size of the icon
  iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
  popupAnchor: [-10, -25] // point from which the popup should open relative to the iconAnchor
});

let addressPoints = [];
let cityMarkers = [];

function generateChart(resChart) {
  const dates = [];
  const diffConfirmCounts = [];
  const confirmPatientCounts = [];
  const deathCounts = [];
  const recoverCounts = [];

  resChart.data.forEach(elm => {
    dates.push(elm.ytd.toString().substring(0, 10));
    diffConfirmCounts.push(elm.diffConfirmed);
    confirmPatientCounts.push(elm.todayConfirmed);
    deathCounts.push(elm.todayDeath);
    recoverCounts.push(elm.todayRecover);
  });
  const chart = c3.generate({
    bindto: "#chart--line",
    data: {
      x: "date",
      xFormat: "%Y-%m-%d",
      columns: [
        ["date", ...dates],
        ["增加數量", ...diffConfirmCounts],
        ["全球確診病例", ...confirmPatientCounts]
      ],
      axes: {
        全球確診病例: "y",
        增加數量: "y2"
      }
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%m-%d"
        }
      },
      y2: {
        show: true
      }
    }
  });

  const chartBar = c3.generate({
    bindto: "#chart--bar",
    data: {
      x: "date",
      xFormat: "%Y-%m-%d",
      columns: [
        ["date", ...dates],
        ["死亡數量", ...deathCounts],
        ["恢復數量", ...recoverCounts]
      ],
      axes: {
        死亡數量: "y",
        恢復數量: "y2"
      }
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%m-%d"
        }
      },
      y2: {
        show: true
      }
    }
  });
  const { todayConfirmed, todayDeath, todayRecover } = resChart.data[0];
  var chartDounut = c3.generate({
    bindto: "#chart--dounut",
    data: {
      columns: [
        ["治療中", todayConfirmed - todayDeath - todayRecover],
        ["恢復", todayRecover],
        ["死亡", todayDeath]
      ],
      type: "donut"
    },
    donut: {
      title: "武漢肺炎",
      label: {
        format: function(value, ratio, id) {
          return value;
        }
      }
    }
  });
}

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000
});

// Create `axios` instance passing the newly created `cache.adapter`
const api = axios.create({
  adapter: cache.adapter
});

axiosRetry(api, { retries: 3 });

axios
  .all([
    api.get(
      "https://cors-anywhere.herokuapp.com/https://od.cdc.gov.tw/eic/Weekly_Age_County_Gender_19CoV.csv"
    ),
    api.get("https://api.coronatracker.com/analytics/country"),
    api.get("https://api.coronatracker.com/v2/analytics/area?limit=100"),
    api.get("https://api.coronatracker.com/v2/stats/diff/global")
  ])
  .then(
    axios.spread((resTaiwan, resCountry, resChina, resChart) => {
      $(".loading__overlay").css("zIndex", -1);
      $(".loading__content").css("zIndex", -1);
      var data = JSON.parse(csvJSON(resTaiwan.data));
      $(data).each(function(k, v) {
        const nowIndex = locations.findIndex(elm => elm.location === v["縣市"]);
        if (locations[nowIndex]) {
          if (locations[nowIndex].count) {
            locations[nowIndex].count += 1;
          } else {
            locations[nowIndex].count = 1;
          }
        }
      });
      resCountry.data
        .filter(
          elm =>
            elm.country !== "China" &&
            elm.country !== "Hong Kong" &&
            elm.country !== "Taiwan*" &&
            elm.country !== "N/A"
        )
        .map(elm => [
          elm.country,
          elm.total_confirmed,
          "確診",
          `${elm.lat} ${elm.lng}`,
          elm.country
        ])
        .concat(
          resChina.data
            .filter(elm => elm.state !== "N/A")
            .map(elm => [
              elm.state,
              elm.total_confirmed,
              "確診",
              `${elm.lat} ${elm.lng}`,
              elm.state
            ])
        )
        .concat(
          locations
            .filter(elm => elm.count)
            .map(elm => [
              elm.location,
              elm.count,
              "確診",
              `${elm.lat} ${elm.lng}`,
              elm.location
            ])
        )
        .forEach(elm => {
          let nowCount = parseInt(elm[1]);
          const tempMarker = L.marker(elm[3].split(" "), {
            icon: virusIcon
          }).bindPopup(`${elm[4]}確診：${elm[1]}`);
          cityMarkers.push(tempMarker);
          while (nowCount--) {
            const arrayLatLng = elm[3].split(" ");
            if (nowCount > 1000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 3));
            } else if (nowCount > 2000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 1.5));
            } else if (nowCount > 3000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 1.2));
            } else if (nowCount > 4000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 1.1));
            } else {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 100));
            }
          }
        });

      generateChart(resChart);

      const cities = L.layerGroup(cityMarkers).addTo(map);
      const heat = L.heatLayer(addressPoints, {
        radius: 25,
        blur: 20,
        minOpacity: 0.5
      }).addTo(map);

      map.on("zoomend", function() {
        const zoomLevel = map.getZoom();
        if (zoomLevel < 5) {
          map.removeLayer(cities);
        }
        if (zoomLevel >= 5) {
          if (map.hasLayer(cities)) {
            console.log("layer already added");
          } else {
            map.addLayer(cities);
          }
        }
      });
    })
  );

$("#btn-open").click(function() {
  $("#modal").css("opacity", 1);
  $("#modal").css("zIndex", 1000);
  $("#btn-open").css("zIndex", -1);
});

$("#btn-close").click(function() {
  $("#modal").css("opacity", 0);
  $("#modal").css("zIndex", -1);
  $("#btn-open").css("zIndex", 2);
});
