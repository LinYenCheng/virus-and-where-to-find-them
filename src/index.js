import "../public/global.css";
import App from "./components/App.svelte";

import router from "./router.js";
import {
  generateDounutChartTaiwan,
  generateChartGlobal,
  generateChartCountry,
} from "./charts.js";

import {
  ages,
  locations,
  modifyCountryName,
  modifyCountryParam,
  removeFbclid,
} from "./util.js";

import jsonTaiwan from "../data/taiwan.json";
// import jsonUSA from "../data/usa.json";
import jsonFinalTimeSeriesData from "../data/finalTimeSeriesData.json";
import jsonRat from "../data/mouse.json";

import { generateGlobalTable, generateTaiwanTable, generateRatTable } from "./dataTable.js";

const urlParams = new URLSearchParams(window.location.search);
const mapMode = urlParams.get("map") || "virus";

function generateInformation(mode) {
  const usaCounties = [];
  const finalSelectOptions = [];

  if (mode === "rat") {
    // Reset counts first
    locations.forEach(loc => loc.count = 0);

    jsonRat.forEach((elm) => {
      const nowLocationIndex = locations.findIndex((loc) => 
        elm.location.includes(loc.location)
      );
      if (nowLocationIndex !== -1) {
        locations[nowLocationIndex].count = (locations[nowLocationIndex].count || 0) + 1;
      }
    });

    locations.filter(loc => loc.count > 0).forEach((loc) => {
      finalSelectOptions.push({
        id: loc.location,
        text: `${loc.location} (${loc.count})`,
        lat: loc.lat,
        lng: loc.lng,
      });
    });

    return {
      finalSelectOptions,
      finalCountries: [],
    };
  }

  const finalCountries = jsonFinalTimeSeriesData
    .sort(function (a, b) {
      return a && b && parseInt(b.confirmed) - parseInt(a.confirmed);
    })
    .concat(usaCounties.filter((elm) => Number(elm.confirmed) > 5000))
    .filter((elm) => elm.lat)
    .map((elm) => {
      const tempName = elm.region;
      finalSelectOptions.push({
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
    );
  return {
    finalSelectOptions,
    finalCountries,
  };
}

function initApp({ selectOptions, finalCountries, mapMode }) {
  let otherCounts = 0;
  let taiwanCounts = 0;

  if (mapMode === "virus") {
    $(jsonTaiwan).each(function (k, v) {
      const nowIndex = locations.findIndex((elm) => elm.location === v["縣市"]);
      const nowAgeIndex = ages.findIndex((elm) => elm.range === v["年齡層"]);
      if (v["是否為境外移入"] === "是") {
        otherCounts += parseInt(v["確定病例數"]);
      } else {
        taiwanCounts += parseInt(v["確定病例數"]);
      }
      if (locations[nowIndex]) {
        locations[nowIndex].count = (locations[nowIndex].count || 0) + parseInt(v["確定病例數"]);
      }

      if (ages[nowAgeIndex]) {
        ages[nowAgeIndex].count = (ages[nowAgeIndex].count || 0) + parseInt(v["確定病例數"]);
      }
    });
  }

  // Initial UI Setup
  setupSelect2(selectOptions, mapMode);
  
  if (mapMode === "virus") {
    setupRouter(selectOptions);
  }

  return getFinalCountriesForMap(finalCountries, mapMode);
}

function setupSelect2(selectOptions, mode) {
  $("#select-country").empty().select2({
    data: selectOptions,
    placeholder: mode === "rat" ? "區域 (老鼠通報總數)" : "區域 (確診數)",
    allowClear: true,
  }).off("select2:select").on("select2:select", function (e) {
    var { data } = e.params;
    if (data) {
      if (mode === "rat") {
        window.map.panTo([data.lat, data.lng]);
        window.map.setZoom(16);
        generateRatTable(data.id);
        return;
      }
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
      router.navigateTo(`country/${data.id.toString().toLowerCase().replace(/ /g, "-")}`);
    }
  });
}

function setupRouter(selectOptions) {
  router
    .add("", function () {
      generateChartCountry({ title: "Taiwan", paramCountry: "taiwan*" });
    })
    .add("country/(:any)", function (country) {
      const nowCountry = country.replace(/-/g, " ").toLocaleLowerCase();
      $("#select-country").val(nowCountry).trigger("change").trigger({
        type: "select2:select",
        params: {
          data: selectOptions[selectOptions.findIndex((elm) => elm.id.toLowerCase() === nowCountry)],
        },
      });
    })
    .check();
}

function getFinalCountriesForMap(finalCountries, mode) {
  if (mode === "rat") {
    return locations
      .filter((elm) => elm.count)
      .map((elm) => [elm.location, elm.count, "老鼠通報", `${elm.lat} ${elm.lng}`]);
  }
  return finalCountries.concat(
    locations
      .filter((elm) => elm.count)
      .map((elm) => [elm.location, elm.count, "確診", `${elm.lat} ${elm.lng}`])
  );
}

// Global update function
window.updateMapModeUI = (mode) => {
  const { finalSelectOptions, finalCountries } = generateInformation(mode);
  setupSelect2(finalSelectOptions, mode);
  
  if (mode === "rat") {
    generateRatTable();
    $("#chart--bar, #chart--line, #chart--dounut").css("display", "none");
  } else {
    generateTaiwanTable();
    generateChartGlobal();
    $("#chart--bar, #chart--line, #chart--dounut").css("display", "block");
  }
  
  const finalMapData = getFinalCountriesForMap(finalCountries, mode);
  app.$set({ finalCountries: finalMapData, mapMode: mode });
};

const initialMode = mapMode;
const { finalSelectOptions, finalCountries } = generateInformation(initialMode);
const finalCountriesWithTaiwan = initApp({
  selectOptions: finalSelectOptions,
  finalCountries,
  mapMode: initialMode,
});

const app = new App({
  target: document.body,
  props: {
    finalCountries: finalCountriesWithTaiwan,
    mapMode: initialMode,
  },
});

setTimeout(() => {
  app.$set({ showLoading: false });
  if (initialMode === "virus") {
    generateChartGlobal();
    generateTaiwanTable();
  } else {
    generateRatTable();
  }
}, 500);

$("#btn-open").click(function () {
  $("#modal").css("display", "block");
  $("#modal").css("opacity", 1);
  $("#modal").css("zIndex", 1000);
  $("#btn-open").css("zIndex", -1);
});

$("#btn-close").click(function () {
  $("#modal").css("display", "none");
  $("#modal").css("opacity", 0);
  $("#modal").css("zIndex", -1);
  $("#btn-open").css("zIndex", 2);
});

removeFbclid();
