import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import router from "./src/router.js";
import {
  generateChart,
  generateDounutChartTaiwan,
  generateChartCountry
} from "./src/charts.js";
import {
  locations,
  getRandomAround,
  modifyCountryName,
  modifyCountryParam
} from "./src/util.js";
import srcVirus from "./virus.png";

let addressPoints = [];
let cityMarkers = [];

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

// Create `axios-cache-adapter` instance
const cache = setupCache({
  readHeaders: true,
  maxAge: 15 * 60 * 1000
});

// Create `axios` instance passing the newly created `cache.adapter`
const api = axios.create({
  adapter: cache.adapter
});

axios
  .all([
    api.get(
      "https://cors-anywhere.herokuapp.com/https://od.cdc.gov.tw/eic/Weekly_Age_County_Gender_19CoV.json"
    ),
    api.get("https://api.coronatracker.com/analytics/country"),
    api.get("https://api.coronatracker.com/v2/analytics/area?limit=100"),
    api.get("https://api.coronatracker.com/v2/stats/diff/global")
  ])
  .then(
    axios.spread((resTaiwan, resCountry, resChina, resChart) => {
      let otherCounts = 0;
      let taiwanCounts = 0;
      const selectOptions = [];
      const countries = resCountry.data;

      $(".loading__overlay").css("zIndex", -1);
      $(".loading__content").css("zIndex", -1);
      $(resTaiwan.data).each(function(k, v) {
        const nowIndex = locations.findIndex(elm => elm.location === v["縣市"]);
        if (v["是否為境外移入"] === "是") {
          otherCounts += 1;
        } else {
          taiwanCounts += 1;
        }
        if (locations[nowIndex]) {
          if (locations[nowIndex].count) {
            locations[nowIndex].count += 1;
          } else {
            locations[nowIndex].count = 1;
          }
        }
      });

      countries.sort(function(a, b) {
        return parseInt(b.total_confirmed) - parseInt(a.total_confirmed);
      });
      countries
        .map(elm => {
          selectOptions.push({
            id: modifyCountryName(elm.country).toLowerCase(),
            text: `${modifyCountryName(elm.country)} (${elm.total_confirmed})`,
            // selected: modifyCountryName(elm.country) === "Taiwan",
            paramCountry: modifyCountryParam(elm.country),
            lng: elm.lng,
            lat: elm.lat
          });
          return [
            elm.country,
            elm.total_confirmed,
            "確診",
            `${elm.lat} ${elm.lng}`
          ];
        })
        .filter(
          elm =>
            elm[0] !== "China" &&
            elm[0] !== "Hong Kong" &&
            elm[0] !== "Taiwan*" &&
            elm[0] !== "N/A"
        )
        .concat(
          resChina.data
            .filter(elm => elm.state !== "N/A")
            .map(elm => [
              elm.state,
              elm.total_confirmed,
              "確診",
              `${elm.lat} ${elm.lng}`
            ])
        )
        .concat(
          locations
            .filter(elm => elm.count)
            .map(elm => [
              elm.location,
              elm.count,
              "確診",
              `${elm.lat} ${elm.lng}`
            ])
        )
        .forEach(elm => {
          let nowCount = parseInt(elm[1]);
          const tempMarker = L.marker(elm[3].split(" "), {
            icon: virusIcon
          }).bindPopup(`${elm[0]}確診：${elm[1]}`);
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

      $("#select-country")
        .select2({
          data: selectOptions,
          placeholder: "國家 (確診數)",
          allowClear: true
        })
        .on("select2:select", function(e) {
          var data = e.params.data;
          map.panTo([data.lat, data.lng]);
          generateChartCountry({
            api,
            title: data.paramCountry,
            paramCountry: modifyCountryParam(data.paramCountry)
          });
          if (
            data.paramCountry === "Taiwan*" ||
            data.paramCountry === "Taiwan"
          ) {
            $("#chart--dounut").css("zIndex", 1);
          } else {
            $("#chart--dounut").css("zIndex", -1);
          }
          router.navigateTo(
            `country/${data.id
              .toString()
              .toLowerCase()
              .replace(/ /g, "-")}`
          );
        });

      generateChart(resChart);
      generateChartCountry({ api, title: "Taiwan", paramCountry: "taiwan*" });
      generateDounutChartTaiwan({
        otherCounts,
        taiwanCounts
      });

      router
        .add("", function() {
          generateChartCountry({
            api,
            title: "Taiwan",
            paramCountry: "taiwan*"
          });
        })
        .add("country/(:any)", function(country) {
          const nowCountry = country.replace(/-/g, " ").toLocaleLowerCase();

          $("#select-country")
            .val(nowCountry)
            .trigger("change")
            .trigger({
              type: "select2:select",
              params: {
                data:
                  selectOptions[
                    selectOptions.findIndex(elm => {
                      return elm.id.toLowerCase() === nowCountry;
                    })
                  ]
              }
            });
        })
        .check();

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
