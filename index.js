import router from "./src/router.js";
import {
  generateDounutChartTaiwan,
  generateChartGlobal,
  generateChartCountry,
} from "./src/charts.js";

import {
  locations,
  getRandomAround,
  modifyCountryName,
  modifyCountryParam,
} from "./src/util.js";

import srcVirus from "./virus.png";

import jsonTaiwan from "./data/taiwan.json";
import jsonFinalTimeSeriesData from "./data/finalTimeSeriesData.json";
import { generateGlobalTable, generateTaiwanTable } from "./src/dataTable.js";

let addressPoints = [];
let cityMarkers = [];

const map = L.map("map").setView([23.5, 120.644], 5);
const tiles = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }
).addTo(map);
const virusIcon = L.icon({
  iconUrl: srcVirus,
  iconSize: [25, 25], // size of the icon
  iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
  popupAnchor: [-10, -25], // point from which the popup should open relative to the iconAnchor
});

function generateInformation() {
  let otherCounts = 0;
  let taiwanCounts = 0;
  const selectOptions = [];
  const countries = jsonFinalTimeSeriesData;

  $(".loading__overlay").css("zIndex", -1);
  $(".loading__content").css("zIndex", -1);
  $(jsonTaiwan).each(function (k, v) {
    const nowIndex = locations.findIndex((elm) => elm.location === v["縣市"]);
    if (v["是否為境外移入"] === "是") {
      otherCounts += parseInt(v["確定病例數"]);
    } else {
      taiwanCounts += parseInt(v["確定病例數"]);
    }
    if (locations[nowIndex]) {
      if (locations[nowIndex].count) {
        locations[nowIndex].count += 1;
      } else {
        locations[nowIndex].count = 1;
      }
    }
  });

  countries.sort(function (a, b) {
    return a && b && parseInt(b.confirmed) - parseInt(a.confirmed);
  });
  countries
    .filter((elm) => elm.lat)
    .map((elm) => {
      const tempName = elm.region;
      selectOptions.push({
        id: modifyCountryName(tempName).toLowerCase(),
        text: `${modifyCountryName(tempName)} (${elm.confirmed})`,
        paramCountry: tempName,
        lng: parseInt(elm.lng),
        lat: parseInt(elm.lat),
      });
      return [tempName, elm.confirmed, "確診", `${elm.lat} ${elm.lng}`];
    })
    .filter(
      (elm) =>
        // elm[0] !== "China" &&
        // elm[0] !== "Hong Kong" &&
        elm[0] !== "Taiwan*" && elm[0] !== "N/A"
    )
    .concat(
      locations
        .filter((elm) => elm.count)
        .map((elm) => [
          elm.location,
          elm.count,
          "確診",
          `${elm.lat} ${elm.lng}`,
        ])
    )
    .forEach((elm) => {
      let nowCount = parseInt(elm[1]);
      const tempMarker = L.marker(elm[3].split(" "), {
        icon: virusIcon,
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
      placeholder: "區域 (確診數)",
      allowClear: true,
    })
    .on("select2:open", function () {
      $("#chart--bar").css("display", "none");
    })
    .on("select2:close", function () {
      $("#chart--bar").css("display", "initial");
    })
    .on("select2:select", function (e) {
      var { data } = e.params;
      if (data) {
        map.panTo([data.lat, data.lng]);
        generateChartCountry({
          title: data.paramCountry,
          paramCountry: modifyCountryParam(data.paramCountry),
        });
        if (data.paramCountry === "Taiwan*" || data.paramCountry === "Taiwan") {
          $("#chart--dounut").css("zIndex", 1);
          generateTaiwanTable();
        } else {
          $("#chart--dounut").css("zIndex", -1);
          generateGlobalTable();
        }
        router.navigateTo(
          `country/${data.id.toString().toLowerCase().replace(/ /g, "-")}`
        );
      }
    });

  generateChartGlobal();
  generateDounutChartTaiwan({
    otherCounts,
    taiwanCounts,
  });
  generateTaiwanTable();

  router
    .add("", function () {
      generateChartCountry({
        title: "Taiwan",
        paramCountry: "taiwan*",
      });
    })
    .add("country/(:any)", function (country) {
      const nowCountry = country.replace(/-/g, " ").toLocaleLowerCase();

      $("#select-country")
        .val(nowCountry)
        .trigger("change")
        .trigger({
          type: "select2:select",
          params: {
            data:
              selectOptions[
                selectOptions.findIndex((elm) => {
                  return elm.id.toLowerCase() === nowCountry;
                })
              ],
          },
        });
    })
    .check();

  const cities = L.layerGroup(cityMarkers).addTo(map);
  const heat = L.heatLayer(addressPoints, {
    radius: 25,
    blur: 20,
    minOpacity: 0.5,
  }).addTo(map);

  map.on("zoomend", function () {
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
  $(".loading__overlay").css("zIndex", -1);
  $(".loading__content").css("zIndex", -1);
}

generateInformation();

$("#btn-open").click(function () {
  $("#modal").css("opacity", 1);
  $("#modal").css("zIndex", 1000);
  $("#btn-open").css("zIndex", -1);
});

$("#btn-close").click(function () {
  $("#modal").css("opacity", 0);
  $("#modal").css("zIndex", -1);
  $("#btn-open").css("zIndex", 2);
});
