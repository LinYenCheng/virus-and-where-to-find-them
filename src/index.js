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

import { generateGlobalTable, generateTaiwanTable } from "./dataTable.js";

function generateInformation() {
  const usaCounties = [];
  const finalSelectOptions = [];
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
        // elm[0] !== 'China' &&
        // elm[0] !== 'Hong Kong' &&
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

const { finalSelectOptions, finalCountries } = generateInformation();

function initApp({ selectOptions, finalCountries }) {
  let otherCounts = 0;
  let taiwanCounts = 0;

  $(".loading__overlay").css("zIndex", -1);
  $(".loading__content").css("zIndex", -1);
  $(jsonTaiwan).each(function (k, v) {
    const nowIndex = locations.findIndex((elm) => elm.location === v["縣市"]);
    const nowAgeIndex = ages.findIndex((elm) => elm.range === v["年齡層"]);
    if (v["是否為境外移入"] === "是") {
      otherCounts += parseInt(v["確定病例數"]);
    } else {
      taiwanCounts += parseInt(v["確定病例數"]);
    }
    if (locations[nowIndex]) {
      if (locations[nowIndex].count) {
        locations[nowIndex].count += parseInt(v["確定病例數"]);
      } else {
        locations[nowIndex].count = 1;
      }
    }

    if (ages[nowAgeIndex]) {
      if (ages[nowAgeIndex].count) {
        ages[nowAgeIndex].count += parseInt(v["確定病例數"]);
      } else {
        ages[nowAgeIndex].count = 1;
      }
    }
  });

  setTimeout(() => {
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
          // map.panTo([data.lat, data.lng]);
          generateChartCountry({
            title: data.paramCountry,
            paramCountry: modifyCountryParam(data.paramCountry),
          });
          if (
            data.paramCountry === "Taiwan*" ||
            data.paramCountry === "Taiwan"
          ) {
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
  }, 500);

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
            data: selectOptions[
              selectOptions.findIndex((elm) => {
                return elm.id.toLowerCase() === nowCountry;
              })
            ],
          },
        });
    })
    .check();

  setTimeout(() => {
    $(".loading__overlay").css("zIndex", -1);
    $(".loading__content").css("zIndex", -1);
    generateChartGlobal();
    generateDounutChartTaiwan({
      otherCounts,
      taiwanCounts,
      locations,
      ages,
    });
    generateTaiwanTable();
  }, 500);

  return finalCountries.concat(
    locations
      .filter((elm) => elm.count)
      .map((elm) => [elm.location, elm.count, "確診", `${elm.lat} ${elm.lng}`])
  );
}

const finalCountriesWithTaiwan = initApp({
  selectOptions: finalSelectOptions,
  finalCountries,
});

const app = new App({
  target: document.body,
  props: {
    finalCountries: finalCountriesWithTaiwan,
  },
});

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

removeFbclid();
